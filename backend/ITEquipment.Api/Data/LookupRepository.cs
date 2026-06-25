using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class LookupRepository(MySqlConnectionFactory connectionFactory)
{
    public async Task<IReadOnlyList<DepartmentDto>> GetDepartmentsAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT department_id, department_code, department_name, description, is_active
            FROM departments
            ORDER BY department_name;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var departments = new List<DepartmentDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            departments.Add(new DepartmentDto(
                DepartmentId: reader.GetInt32("department_id"),
                DepartmentCode: reader.GetString("department_code"),
                DepartmentName: reader.GetString("department_name"),
                Description: reader.IsDBNull(reader.GetOrdinal("description"))
                    ? null
                    : reader.GetString("description"),
                IsActive: reader.GetBoolean("is_active")));
        }

        return departments;
    }

    public async Task<IReadOnlyList<RoleDto>> GetRolesAsync(CancellationToken cancellationToken)
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
            roles.Add(new RoleDto(
                RoleId: reader.GetInt32("role_id"),
                RoleName: reader.GetString("role_name"),
                RoleCode: reader.GetString("role_code"),
                Description: reader.IsDBNull(reader.GetOrdinal("description"))
                    ? null
                    : reader.GetString("description"),
                IsSystemRole: reader.GetBoolean("is_system_role"),
                IsActive: reader.GetBoolean("is_active")));
        }

        return roles;
    }
}
