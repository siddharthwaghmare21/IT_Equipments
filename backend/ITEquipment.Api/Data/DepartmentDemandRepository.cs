using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class DepartmentDemandRepository(MySqlConnectionFactory connectionFactory)
{
    public async Task<IReadOnlyList<DepartmentDemandDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT dd.demand_id, dd.department_id, d.department_name,
                   COALESCE(d.location, 'Unknown Location') AS location,
                   dd.demand_count, dd.source, dd.remarks,
                   dd.created_at, dd.updated_at
            FROM department_demands dd
            INNER JOIN departments d ON d.department_id = dd.department_id
            ORDER BY d.location, d.department_name;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var demands = new List<DepartmentDemandDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            demands.Add(ReadDemand(reader));
        }

        return demands;
    }

    public async Task<DepartmentDemandDto?> GetByDepartmentIdAsync(long departmentId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT dd.demand_id, dd.department_id, d.department_name,
                   COALESCE(d.location, 'Unknown Location') AS location,
                   dd.demand_count, dd.source, dd.remarks,
                   dd.created_at, dd.updated_at
            FROM department_demands dd
            INNER JOIN departments d ON d.department_id = dd.department_id
            WHERE dd.department_id = @DepartmentId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@DepartmentId", departmentId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadDemand(reader) : null;
    }

    public async Task<DepartmentDemandDto> UpsertAsync(DepartmentDemandUpsertRequest request, CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO department_demands (
                department_id, demand_count, source, remarks
            )
            VALUES (
                @DepartmentId, @DemandCount, @Source, @Remarks
            )
            ON DUPLICATE KEY UPDATE
                demand_count = VALUES(demand_count),
                source = VALUES(source),
                remarks = VALUES(remarks),
                updated_at = CURRENT_TIMESTAMP;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@DepartmentId", request.DepartmentId);
        command.Parameters.AddWithValue("@DemandCount", request.DemandCount);
        command.Parameters.AddWithValue("@Source", ToDbValue(request.Source ?? "Excel Import"));
        command.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));

        await command.ExecuteNonQueryAsync(cancellationToken);

        var demand = await GetByDepartmentIdAsync(request.DepartmentId, cancellationToken);
        return demand ?? throw new InvalidOperationException("Department demand was saved but could not be loaded.");
    }

    public async Task<bool> DeleteByDepartmentIdAsync(long departmentId, CancellationToken cancellationToken)
    {
        const string sql = """
            DELETE FROM department_demands
            WHERE department_id = @DepartmentId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@DepartmentId", departmentId);

        return await command.ExecuteNonQueryAsync(cancellationToken) > 0;
    }

    private static DepartmentDemandDto ReadDemand(MySqlDataReader reader)
    {
        return new DepartmentDemandDto(
            DemandId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("demand_id"))),
            DepartmentId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("department_id"))),
            DepartmentName: reader.GetString("department_name"),
            Location: reader.GetString("location"),
            DemandCount: Convert.ToInt32(reader.GetValue(reader.GetOrdinal("demand_count"))),
            Source: reader.GetString("source"),
            Remarks: GetNullableString(reader, "remarks"),
            CreatedAt: GetDateTimeOffset(reader, "created_at"),
            UpdatedAt: GetDateTimeOffset(reader, "updated_at"));
    }

    private static string? GetNullableString(MySqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
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
