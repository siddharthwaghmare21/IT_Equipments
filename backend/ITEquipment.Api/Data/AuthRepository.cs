using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class AuthRepository(MySqlConnectionFactory connectionFactory)
{
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
        return await reader.ReadAsync(cancellationToken)
            ? new UserDto(
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
                UpdatedAt: GetDateTimeOffset(reader, "updated_at"))
            : null;
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
