using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class ApprovalRepository(MySqlConnectionFactory connectionFactory)
{
    public async Task<IReadOnlyList<ApprovalRequestDto>> GetPendingUserAccessRequestsAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT ar.approval_request_id, ar.request_type, ar.entity_name, ar.entity_id,
                   ar.requested_by, u.full_name AS requested_user_name,
                   u.email AS requested_user_email, ar.requested_role_id,
                   r.role_code AS requested_role_code, r.role_name AS requested_role_name,
                   ar.approval_status, ar.approved_by, ar.approved_at, ar.remarks,
                   ar.created_at, ar.updated_at
            FROM approval_requests ar
            LEFT JOIN users u ON u.user_id = ar.requested_by
            LEFT JOIN roles r ON r.role_id = ar.requested_role_id
            WHERE ar.request_type = 'User Access'
              AND ar.approval_status = 'Pending'
            ORDER BY ar.created_at ASC, ar.approval_request_id ASC;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var requests = new List<ApprovalRequestDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            requests.Add(ReadApprovalRequest(reader));
        }

        return requests;
    }

    public async Task<ApprovalDecisionResponse?> ApproveUserAccessAsync(
        long approvalRequestId,
        ApprovalDecisionRequest request,
        CancellationToken cancellationToken)
    {
        return await DecideUserAccessAsync(
            approvalRequestId,
            request,
            approvalStatus: "Approved",
            accountStatus: "Active",
            message: "User access request approved.",
            cancellationToken);
    }

    public async Task<ApprovalDecisionResponse?> RejectUserAccessAsync(
        long approvalRequestId,
        ApprovalDecisionRequest request,
        CancellationToken cancellationToken)
    {
        return await DecideUserAccessAsync(
            approvalRequestId,
            request,
            approvalStatus: "Rejected",
            accountStatus: "Rejected",
            message: "User access request rejected.",
            cancellationToken);
    }

    private async Task<ApprovalDecisionResponse?> DecideUserAccessAsync(
        long approvalRequestId,
        ApprovalDecisionRequest request,
        string approvalStatus,
        string accountStatus,
        string message,
        CancellationToken cancellationToken)
    {
        const string loadSql = """
            SELECT ar.approval_request_id, ar.requested_by,
                   requested_role.role_code AS requested_role_code
            FROM approval_requests ar
            LEFT JOIN roles requested_role ON requested_role.role_id = ar.requested_role_id
            WHERE ar.approval_request_id = @ApprovalRequestId
              AND ar.request_type = 'User Access'
              AND ar.approval_status = 'Pending'
            LIMIT 1;
            """;

        const string updateApprovalSql = """
            UPDATE approval_requests
            SET approval_status = @ApprovalStatus,
                approved_by = @ApprovedBy,
                approved_at = CURRENT_TIMESTAMP,
                remarks = COALESCE(@Remarks, remarks)
            WHERE approval_request_id = @ApprovalRequestId;
            """;

        const string updateUserSql = """
            UPDATE users
            SET account_status = @AccountStatus,
                approved_by = @ApprovedBy,
                approved_at = CASE WHEN @AccountStatus = 'Active' THEN CURRENT_TIMESTAMP ELSE approved_at END
            WHERE user_id = @UserId;
            """;

        const string notificationSql = """
            INSERT INTO notifications (
                user_id, notification_type, title, message,
                related_entity_name, related_entity_id
            )
            VALUES (
                @UserId, 'User Access', @Title, @Message,
                'approval_requests', @ApprovalRequestId
            );
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        long? userId;
        string? requestedRoleCode;
        await using (var loadCommand = new MySqlCommand(loadSql, connection, transaction))
        {
            loadCommand.Parameters.AddWithValue("@ApprovalRequestId", approvalRequestId);
            loadCommand.Parameters.AddWithValue("@ApprovedBy", request.ApprovedByUserId);
            await using var reader = await loadCommand.ExecuteReaderAsync(cancellationToken);
            if (!await reader.ReadAsync(cancellationToken))
            {
                await transaction.RollbackAsync(cancellationToken);
                return null;
            }

            userId = GetNullableInt64(reader, "requested_by");
            requestedRoleCode = GetNullableString(reader, "requested_role_code");
        }

        if (!userId.HasValue)
        {
            await transaction.RollbackAsync(cancellationToken);
            return null;
        }

        if (approvalStatus.Equals("Approved", StringComparison.OrdinalIgnoreCase) &&
            requestedRoleCode?.Equals("SUPER_ADMIN", StringComparison.OrdinalIgnoreCase) == true)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new UnauthorizedAccessException("Super Admin access requests are not allowed after initial setup.");
        }

        await using (var updateApprovalCommand = new MySqlCommand(updateApprovalSql, connection, transaction))
        {
            updateApprovalCommand.Parameters.AddWithValue("@ApprovalRequestId", approvalRequestId);
            updateApprovalCommand.Parameters.AddWithValue("@ApprovalStatus", approvalStatus);
            updateApprovalCommand.Parameters.AddWithValue("@ApprovedBy", request.ApprovedByUserId);
            updateApprovalCommand.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));
            await updateApprovalCommand.ExecuteNonQueryAsync(cancellationToken);
        }

        await using (var updateUserCommand = new MySqlCommand(updateUserSql, connection, transaction))
        {
            updateUserCommand.Parameters.AddWithValue("@UserId", userId.Value);
            updateUserCommand.Parameters.AddWithValue("@AccountStatus", accountStatus);
            updateUserCommand.Parameters.AddWithValue("@ApprovedBy", request.ApprovedByUserId);
            await updateUserCommand.ExecuteNonQueryAsync(cancellationToken);
        }

        await using (var notificationCommand = new MySqlCommand(notificationSql, connection, transaction))
        {
            notificationCommand.Parameters.AddWithValue("@UserId", userId.Value);
            notificationCommand.Parameters.AddWithValue("@Title", message);
            notificationCommand.Parameters.AddWithValue("@Message", request.Remarks ?? message);
            notificationCommand.Parameters.AddWithValue("@ApprovalRequestId", approvalRequestId);
            await notificationCommand.ExecuteNonQueryAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);

        return new ApprovalDecisionResponse(
            approvalRequestId,
            userId.Value,
            approvalStatus,
            accountStatus,
            message);
    }

    private static ApprovalRequestDto ReadApprovalRequest(MySqlDataReader reader)
    {
        return new ApprovalRequestDto(
            ApprovalRequestId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("approval_request_id"))),
            RequestType: reader.GetString("request_type"),
            EntityName: GetNullableString(reader, "entity_name"),
            EntityId: GetNullableInt64(reader, "entity_id"),
            RequestedBy: GetNullableInt64(reader, "requested_by"),
            RequestedUserName: GetNullableString(reader, "requested_user_name"),
            RequestedUserEmail: GetNullableString(reader, "requested_user_email"),
            RequestedRoleId: GetNullableInt64(reader, "requested_role_id"),
            RequestedRoleCode: GetNullableString(reader, "requested_role_code"),
            RequestedRoleName: GetNullableString(reader, "requested_role_name"),
            ApprovalStatus: reader.GetString("approval_status"),
            ApprovedBy: GetNullableInt64(reader, "approved_by"),
            ApprovedAt: GetNullableDateTimeOffset(reader, "approved_at"),
            Remarks: GetNullableString(reader, "remarks"),
            CreatedAt: GetDateTimeOffset(reader, "created_at"),
            UpdatedAt: GetDateTimeOffset(reader, "updated_at"));
    }

    private static string? GetNullableString(MySqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }

    private static long? GetNullableInt64(MySqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal) ? null : Convert.ToInt64(reader.GetValue(ordinal));
    }

    private static DateTimeOffset? GetNullableDateTimeOffset(MySqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal) ? null : GetDateTimeOffset(reader, columnName);
    }

    private static DateTimeOffset GetDateTimeOffset(MySqlDataReader reader, string columnName)
    {
        return new DateTimeOffset(DateTime.SpecifyKind(reader.GetDateTime(columnName), DateTimeKind.Local));
    }

    private static object ToDbValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? DBNull.Value : value.Trim();
    }
}
