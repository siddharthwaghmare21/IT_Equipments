using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class RoleRepository(MySqlConnectionFactory connectionFactory)
{
    public async Task<IReadOnlyList<RoleDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT role_id, role_name, role_code, description, is_system_role, is_active
            FROM roles
            ORDER BY role_id;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var roles = new List<RoleDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            roles.Add(ReadRole(reader));
        }

        return roles;
    }

    public async Task<RoleDto?> GetByIdAsync(long roleId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT role_id, role_name, role_code, description, is_system_role, is_active
            FROM roles
            WHERE role_id = @RoleId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@RoleId", roleId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadRole(reader) : null;
    }

    private static RoleDto ReadRole(MySqlDataReader reader)
    {
        return new RoleDto(
            RoleId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("role_id"))),
            RoleName: reader.GetString("role_name"),
            RoleCode: reader.GetString("role_code"),
            Description: GetNullableString(reader, "description"),
            IsSystemRole: reader.GetBoolean("is_system_role"),
            IsActive: reader.GetBoolean("is_active"));
    }

    private static string? GetNullableString(MySqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }
}
