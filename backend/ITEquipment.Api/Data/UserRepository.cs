using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class UserRepository(MySqlConnectionFactory connectionFactory)
{
    private const string BaseSelect = """
        SELECT u.user_id, u.role_id, r.role_code, r.role_name,
               u.department_id, d.department_name, u.full_name, u.email, u.phone,
               u.account_status, u.email_verified, u.last_login_at,
               u.created_at, u.updated_at
        FROM users u
        INNER JOIN roles r ON r.role_id = u.role_id
        LEFT JOIN departments d ON d.department_id = u.department_id
        """;

    public async Task<IReadOnlyList<UserDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand($"""
            {BaseSelect}
            ORDER BY u.created_at DESC, u.user_id DESC;
            """, connection);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var users = new List<UserDto>();

        while (await reader.ReadAsync(cancellationToken))
        {
            users.Add(ReadUser(reader));
        }

        return users;
    }

    public async Task<UserDto?> UpdateRoleAsync(long userId, string roleCode, CancellationToken cancellationToken)
    {
        if (roleCode.Equals("SUPER_ADMIN", StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Super Admin can only be created during initial system setup.");
        }

        var existingUser = await GetByIdAsync(userId, cancellationToken);
        if (existingUser?.RoleCode.Equals("SUPER_ADMIN", StringComparison.OrdinalIgnoreCase) == true)
        {
            throw new UnauthorizedAccessException("Super Admin role is protected and cannot be changed.");
        }

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand("""
            UPDATE users u
            INNER JOIN roles r ON r.role_code = @RoleCode AND r.is_active = TRUE
            SET u.role_id = r.role_id
            WHERE u.user_id = @UserId;
            """, connection);

        command.Parameters.AddWithValue("@UserId", userId);
        command.Parameters.AddWithValue("@RoleCode", roleCode.Trim().ToUpperInvariant());

        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        return affectedRows == 0 ? null : await GetByIdAsync(userId, cancellationToken);
    }

    public async Task<UserDto?> UpdateStatusAsync(long userId, string accountStatus, CancellationToken cancellationToken)
    {
        var existingUser = await GetByIdAsync(userId, cancellationToken);
        if (existingUser?.RoleCode.Equals("SUPER_ADMIN", StringComparison.OrdinalIgnoreCase) == true)
        {
            throw new UnauthorizedAccessException("Super Admin account is protected and cannot be disabled.");
        }

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand("""
            UPDATE users
            SET account_status = @AccountStatus
            WHERE user_id = @UserId;
            """, connection);

        command.Parameters.AddWithValue("@UserId", userId);
        command.Parameters.AddWithValue("@AccountStatus", accountStatus.Trim());

        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        return affectedRows == 0 ? null : await GetByIdAsync(userId, cancellationToken);
    }

    private async Task<UserDto?> GetByIdAsync(long userId, CancellationToken cancellationToken)
    {
        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand($"""
            {BaseSelect}
            WHERE u.user_id = @UserId;
            """, connection);

        command.Parameters.AddWithValue("@UserId", userId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadUser(reader) : null;
    }

    private static UserDto ReadUser(MySqlDataReader reader)
    {
        return new UserDto(
            UserId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("user_id"))),
            RoleId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("role_id"))),
            RoleCode: reader.GetString("role_code"),
            RoleName: reader.GetString("role_name"),
            DepartmentId: reader.IsDBNull(reader.GetOrdinal("department_id"))
                ? null
                : Convert.ToInt64(reader.GetValue(reader.GetOrdinal("department_id"))),
            DepartmentName: reader.IsDBNull(reader.GetOrdinal("department_name"))
                ? null
                : reader.GetString("department_name"),
            FullName: reader.GetString("full_name"),
            Email: reader.GetString("email"),
            Phone: reader.IsDBNull(reader.GetOrdinal("phone")) ? null : reader.GetString("phone"),
            AccountStatus: reader.GetString("account_status"),
            EmailVerified: reader.GetBoolean("email_verified"),
            LastLoginAt: reader.IsDBNull(reader.GetOrdinal("last_login_at"))
                ? null
                : new DateTimeOffset(reader.GetDateTime("last_login_at")),
            CreatedAt: new DateTimeOffset(reader.GetDateTime("created_at")),
            UpdatedAt: new DateTimeOffset(reader.GetDateTime("updated_at")));
    }
}
