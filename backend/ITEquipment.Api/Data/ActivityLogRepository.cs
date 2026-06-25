using MySqlConnector;
using ITEquipment.Api.Models;

namespace ITEquipment.Api.Data;

public sealed class ActivityLogRepository(MySqlConnectionFactory connectionFactory)
{
    public async Task<IReadOnlyList<ActivityLogDto>> GetRecentAsync(int limit, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT al.activity_log_id, al.user_id, u.full_name AS user_full_name,
                   r.role_name AS user_role_name, al.module_name, al.action_name,
                   al.entity_name, al.entity_id, al.description, al.ip_address,
                   al.user_agent, al.status, al.created_at
            FROM activity_logs al
            LEFT JOIN users u ON u.user_id = al.user_id
            LEFT JOIN roles r ON r.role_id = u.role_id
            ORDER BY al.created_at DESC, al.activity_log_id DESC
            LIMIT @Limit;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Limit", Math.Clamp(limit, 1, 500));

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var logs = new List<ActivityLogDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            logs.Add(new ActivityLogDto(
                ActivityLogId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("activity_log_id"))),
                UserId: GetNullableInt64(reader, "user_id"),
                UserFullName: GetNullableString(reader, "user_full_name"),
                UserRoleName: GetNullableString(reader, "user_role_name"),
                ModuleName: reader.GetString("module_name"),
                ActionName: reader.GetString("action_name"),
                EntityName: GetNullableString(reader, "entity_name"),
                EntityId: GetNullableInt64(reader, "entity_id"),
                Description: reader.GetString("description"),
                IpAddress: GetNullableString(reader, "ip_address"),
                UserAgent: GetNullableString(reader, "user_agent"),
                Status: reader.GetString("status"),
                CreatedAt: GetDateTimeOffset(reader, "created_at")));
        }

        return logs;
    }

    public async Task CreateAsync(
        long? userId,
        string moduleName,
        string actionName,
        string? entityName,
        long? entityId,
        string description,
        string? ipAddress,
        string? userAgent,
        string status,
        CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO activity_logs (
                user_id, module_name, action_name, entity_name, entity_id,
                description, ip_address, user_agent, status
            )
            VALUES (
                @UserId, @ModuleName, @ActionName, @EntityName, @EntityId,
                @Description, @IpAddress, @UserAgent, @Status
            );
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@UserId", ToDbValue(userId));
        command.Parameters.AddWithValue("@ModuleName", TrimTo(moduleName, 80));
        command.Parameters.AddWithValue("@ActionName", TrimTo(actionName, 120));
        command.Parameters.AddWithValue("@EntityName", ToDbValue(TrimTo(entityName, 120)));
        command.Parameters.AddWithValue("@EntityId", ToDbValue(entityId));
        command.Parameters.AddWithValue("@Description", description);
        command.Parameters.AddWithValue("@IpAddress", ToDbValue(TrimTo(ipAddress, 45)));
        command.Parameters.AddWithValue("@UserAgent", ToDbValue(TrimTo(userAgent, 255)));
        command.Parameters.AddWithValue("@Status", status);

        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static string? TrimTo(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var trimmed = value.Trim();
        return trimmed.Length <= maxLength ? trimmed : trimmed[..maxLength];
    }

    private static object ToDbValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? DBNull.Value : value.Trim();
    }

    private static object ToDbValue(long? value)
    {
        return value.HasValue ? value.Value : DBNull.Value;
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

    private static DateTimeOffset GetDateTimeOffset(MySqlDataReader reader, string columnName)
    {
        return new DateTimeOffset(DateTime.SpecifyKind(reader.GetDateTime(columnName), DateTimeKind.Local));
    }
}
