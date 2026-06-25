using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class AuthRepository(MySqlConnectionFactory connectionFactory)
{
    private const int DefaultOtpExpiryMinutes = 10;
    private const int DefaultOtpMaxAttempts = 5;

    public async Task<bool> HasActiveSuperAdminAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT EXISTS (
                SELECT 1
                FROM users u
                INNER JOIN roles r ON r.role_id = u.role_id
                WHERE r.role_code = 'SUPER_ADMIN'
                  AND u.account_status = 'Active'
                LIMIT 1
            );
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        return Convert.ToBoolean(await command.ExecuteScalarAsync(cancellationToken));
    }

    public async Task<UserDto> CreateSuperAdminAsync(
        SuperAdminBootstrapRequest request,
        string passwordHash,
        CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO users (
                role_id, department_id, full_name, email, phone, password_hash,
                account_status, email_verified, approved_at
            )
            SELECT role_id, @DepartmentId, @FullName, @Email, @Phone, @PasswordHash,
                   'Active', TRUE, CURRENT_TIMESTAMP
            FROM roles
            WHERE role_code = 'SUPER_ADMIN';
            SELECT LAST_INSERT_ID();
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@DepartmentId", ToDbValue(request.DepartmentId));
        command.Parameters.AddWithValue("@FullName", request.FullName.Trim());
        command.Parameters.AddWithValue("@Email", request.Email.Trim().ToLowerInvariant());
        command.Parameters.AddWithValue("@Phone", ToDbValue(request.Phone));
        command.Parameters.AddWithValue("@PasswordHash", passwordHash);

        var userId = Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken));
        var user = await GetUserByIdAsync(userId, cancellationToken);
        return user ?? throw new InvalidOperationException("Super Admin was created but could not be loaded.");
    }

    public async Task<LoginUserRecord?> GetLoginUserByEmailAsync(string email, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT u.user_id, u.role_id, r.role_code, r.role_name,
                   u.department_id, d.department_name, u.full_name, u.email, u.phone,
                   u.password_hash, u.account_status, u.email_verified, u.last_login_at,
                   u.created_at, u.updated_at
            FROM users u
            INNER JOIN roles r ON r.role_id = u.role_id
            LEFT JOIN departments d ON d.department_id = u.department_id
            WHERE u.email = @Email;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Email", email.Trim().ToLowerInvariant());

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        var user = ReadUser(reader);
        var passwordHash = reader.GetString("password_hash");
        return new LoginUserRecord(user, passwordHash);
    }

    public async Task<UserDto?> MarkLoginSuccessAsync(long userId, CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE users
            SET last_login_at = CURRENT_TIMESTAMP
            WHERE user_id = @UserId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@UserId", userId);

        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        return affectedRows == 0 ? null : await GetUserByIdAsync(userId, cancellationToken);
    }

    public async Task<SignupResponse> CreateSignupRequestAsync(
        SignupRequest request,
        string passwordHash,
        CancellationToken cancellationToken)
    {
        const string userSql = """
            INSERT INTO users (
                role_id, department_id, full_name, email, phone, password_hash,
                account_status, email_verified
            )
            SELECT role_id, @DepartmentId, @FullName, @Email, @Phone, @PasswordHash,
                   'Pending', FALSE
            FROM roles
            WHERE role_code = @RequestedRoleCode
              AND is_active = TRUE;
            SELECT LAST_INSERT_ID();
            """;

        const string approvalSql = """
            INSERT INTO approval_requests (
                request_type, entity_name, entity_id, requested_by,
                requested_role_id, approval_status, remarks
            )
            SELECT 'User Access', 'users', @UserId, @UserId,
                   role_id, 'Pending', @Remarks
            FROM roles
            WHERE role_code = @RequestedRoleCode;
            SELECT LAST_INSERT_ID();
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await using var userCommand = new MySqlCommand(userSql, connection, transaction);
        userCommand.Parameters.AddWithValue("@DepartmentId", ToDbValue(request.DepartmentId));
        userCommand.Parameters.AddWithValue("@FullName", request.FullName.Trim());
        userCommand.Parameters.AddWithValue("@Email", request.Email.Trim().ToLowerInvariant());
        userCommand.Parameters.AddWithValue("@Phone", ToDbValue(request.Phone));
        userCommand.Parameters.AddWithValue("@PasswordHash", passwordHash);
        userCommand.Parameters.AddWithValue("@RequestedRoleCode", request.RequestedRoleCode.Trim().ToUpperInvariant());

        var userId = Convert.ToInt64(await userCommand.ExecuteScalarAsync(cancellationToken));
        if (userId == 0)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new InvalidOperationException("Requested role does not exist.");
        }

        await using var approvalCommand = new MySqlCommand(approvalSql, connection, transaction);
        approvalCommand.Parameters.AddWithValue("@UserId", userId);
        approvalCommand.Parameters.AddWithValue("@RequestedRoleCode", request.RequestedRoleCode.Trim().ToUpperInvariant());
        approvalCommand.Parameters.AddWithValue("@Remarks", $"Access request created for {request.RequestedRoleCode.Trim().ToUpperInvariant()} role.");

        var approvalRequestId = Convert.ToInt64(await approvalCommand.ExecuteScalarAsync(cancellationToken));
        await transaction.CommitAsync(cancellationToken);

        var user = await GetUserByIdAsync(userId, cancellationToken);
        return new SignupResponse(
            user ?? throw new InvalidOperationException("Signup request was created but user could not be loaded."),
            approvalRequestId,
            "Signup request submitted for approval.");
    }

    public async Task<OtpRequestResponse> CreateEmailOtpAsync(
        string email,
        string purpose,
        string otpHash,
        CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO email_otp_requests (
                user_id, email, purpose, otp_hash, expires_at, max_attempts
            )
            SELECT user_id, @Email, @Purpose, @OtpHash,
                   DATE_ADD(CURRENT_TIMESTAMP, INTERVAL @ExpiryMinutes MINUTE),
                   @MaxAttempts
            FROM users
            WHERE email = @Email
            LIMIT 1;
            SELECT LAST_INSERT_ID();
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Email", email.Trim().ToLowerInvariant());
        command.Parameters.AddWithValue("@Purpose", purpose);
        command.Parameters.AddWithValue("@OtpHash", otpHash);
        command.Parameters.AddWithValue("@ExpiryMinutes", DefaultOtpExpiryMinutes);
        command.Parameters.AddWithValue("@MaxAttempts", DefaultOtpMaxAttempts);

        var otpRequestId = Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken));
        if (otpRequestId == 0)
        {
            throw new InvalidOperationException("User email does not exist.");
        }

        var otpRecord = await GetOtpByIdAsync(otpRequestId, cancellationToken)
            ?? throw new InvalidOperationException("OTP was created but could not be loaded.");

        return new OtpRequestResponse(
            otpRecord.OtpRequestId,
            otpRecord.Email,
            otpRecord.Purpose,
            otpRecord.ExpiresAt,
            "OTP generated successfully.");
    }

    public async Task<OtpRecord?> GetLatestOtpAsync(string email, string purpose, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT email_otp_request_id, user_id, email, purpose, otp_hash,
                   expires_at, verified_at, attempts, max_attempts, is_used
            FROM email_otp_requests
            WHERE email = @Email
              AND purpose = @Purpose
            ORDER BY email_otp_request_id DESC
            LIMIT 1;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Email", email.Trim().ToLowerInvariant());
        command.Parameters.AddWithValue("@Purpose", purpose);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadOtp(reader) : null;
    }

    public async Task MarkOtpAttemptAsync(long otpRequestId, CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE email_otp_requests
            SET attempts = attempts + 1
            WHERE email_otp_request_id = @OtpRequestId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@OtpRequestId", otpRequestId);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task MarkOtpVerifiedAsync(long otpRequestId, long? userId, CancellationToken cancellationToken)
    {
        const string updateOtpSql = """
            UPDATE email_otp_requests
            SET is_used = TRUE,
                verified_at = CURRENT_TIMESTAMP
            WHERE email_otp_request_id = @OtpRequestId;
            """;

        const string updateUserSql = """
            UPDATE users
            SET email_verified = TRUE
            WHERE user_id = @UserId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await using var updateOtpCommand = new MySqlCommand(updateOtpSql, connection, transaction);
        updateOtpCommand.Parameters.AddWithValue("@OtpRequestId", otpRequestId);
        await updateOtpCommand.ExecuteNonQueryAsync(cancellationToken);

        if (userId.HasValue)
        {
            await using var updateUserCommand = new MySqlCommand(updateUserSql, connection, transaction);
            updateUserCommand.Parameters.AddWithValue("@UserId", userId.Value);
            await updateUserCommand.ExecuteNonQueryAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);
    }

    private async Task<UserDto?> GetUserByIdAsync(long userId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT u.user_id, u.role_id, r.role_code, r.role_name,
                   u.department_id, d.department_name, u.full_name, u.email, u.phone,
                   u.account_status, u.email_verified, u.last_login_at,
                   u.created_at, u.updated_at
            FROM users u
            INNER JOIN roles r ON r.role_id = u.role_id
            LEFT JOIN departments d ON d.department_id = u.department_id
            WHERE u.user_id = @UserId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@UserId", userId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadUser(reader) : null;
    }

    private async Task<OtpRecord?> GetOtpByIdAsync(long otpRequestId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT email_otp_request_id, user_id, email, purpose, otp_hash,
                   expires_at, verified_at, attempts, max_attempts, is_used
            FROM email_otp_requests
            WHERE email_otp_request_id = @OtpRequestId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@OtpRequestId", otpRequestId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadOtp(reader) : null;
    }

    private static UserDto ReadUser(MySqlDataReader reader)
    {
        return new UserDto(
            UserId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("user_id"))),
            RoleId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("role_id"))),
            RoleCode: reader.GetString("role_code"),
            RoleName: reader.GetString("role_name"),
            DepartmentId: GetNullableInt64(reader, "department_id"),
            DepartmentName: GetNullableString(reader, "department_name"),
            FullName: reader.GetString("full_name"),
            Email: reader.GetString("email"),
            Phone: GetNullableString(reader, "phone"),
            AccountStatus: reader.GetString("account_status"),
            EmailVerified: reader.GetBoolean("email_verified"),
            LastLoginAt: GetNullableDateTimeOffset(reader, "last_login_at"),
            CreatedAt: GetDateTimeOffset(reader, "created_at"),
            UpdatedAt: GetDateTimeOffset(reader, "updated_at"));
    }

    private static OtpRecord ReadOtp(MySqlDataReader reader)
    {
        return new OtpRecord(
            OtpRequestId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("email_otp_request_id"))),
            UserId: GetNullableInt64(reader, "user_id"),
            Email: reader.GetString("email"),
            Purpose: reader.GetString("purpose"),
            OtpHash: reader.GetString("otp_hash"),
            ExpiresAt: GetDateTimeOffset(reader, "expires_at"),
            VerifiedAt: GetNullableDateTimeOffset(reader, "verified_at"),
            Attempts: Convert.ToInt32(reader.GetValue(reader.GetOrdinal("attempts"))),
            MaxAttempts: Convert.ToInt32(reader.GetValue(reader.GetOrdinal("max_attempts"))),
            IsUsed: reader.GetBoolean("is_used"));
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

    private static object ToDbValue(long? value)
    {
        return value.HasValue ? value.Value : DBNull.Value;
    }
}
