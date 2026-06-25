using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class DepartmentRepository(MySqlConnectionFactory connectionFactory)
{
    public async Task<IReadOnlyList<DepartmentDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT department_id, department_code, department_name, department_head,
                   contact_email, contact_phone, location, description, is_active
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
            departments.Add(ReadDepartment(reader));
        }

        return departments;
    }

    public async Task<DepartmentDto?> GetByIdAsync(long departmentId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT department_id, department_code, department_name, department_head,
                   contact_email, contact_phone, location, description, is_active
            FROM departments
            WHERE department_id = @DepartmentId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@DepartmentId", departmentId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadDepartment(reader) : null;
    }

    public async Task<DepartmentDto> CreateAsync(DepartmentCreateRequest request, CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO departments (
                department_code, department_name, department_head, contact_email,
                contact_phone, location, description, is_active
            )
            VALUES (
                @DepartmentCode, @DepartmentName, @DepartmentHead, @ContactEmail,
                @ContactPhone, @Location, @Description, TRUE
            );
            SELECT LAST_INSERT_ID();
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        AddEditableParameters(command, request);

        var newId = Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken));
        var department = await GetByIdAsync(newId, cancellationToken);
        return department ?? throw new InvalidOperationException("Department was created but could not be loaded.");
    }

    public async Task<DepartmentDto?> UpdateAsync(long departmentId, DepartmentUpdateRequest request, CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE departments
            SET department_code = @DepartmentCode,
                department_name = @DepartmentName,
                department_head = @DepartmentHead,
                contact_email = @ContactEmail,
                contact_phone = @ContactPhone,
                location = @Location,
                description = @Description,
                is_active = @IsActive
            WHERE department_id = @DepartmentId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@DepartmentId", departmentId);
        AddEditableParameters(command, request);
        command.Parameters.AddWithValue("@IsActive", request.IsActive);

        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        return affectedRows == 0 ? null : await GetByIdAsync(departmentId, cancellationToken);
    }

    public async Task<bool> DeactivateAsync(long departmentId, CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE departments
            SET is_active = FALSE
            WHERE department_id = @DepartmentId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@DepartmentId", departmentId);

        return await command.ExecuteNonQueryAsync(cancellationToken) > 0;
    }

    private static void AddEditableParameters(MySqlCommand command, DepartmentCreateRequest request)
    {
        command.Parameters.AddWithValue("@DepartmentCode", request.DepartmentCode.Trim());
        command.Parameters.AddWithValue("@DepartmentName", request.DepartmentName.Trim());
        command.Parameters.AddWithValue("@DepartmentHead", ToDbValue(request.DepartmentHead));
        command.Parameters.AddWithValue("@ContactEmail", ToDbValue(request.ContactEmail));
        command.Parameters.AddWithValue("@ContactPhone", ToDbValue(request.ContactPhone));
        command.Parameters.AddWithValue("@Location", ToDbValue(request.Location));
        command.Parameters.AddWithValue("@Description", ToDbValue(request.Description));
    }

    private static void AddEditableParameters(MySqlCommand command, DepartmentUpdateRequest request)
    {
        command.Parameters.AddWithValue("@DepartmentCode", request.DepartmentCode.Trim());
        command.Parameters.AddWithValue("@DepartmentName", request.DepartmentName.Trim());
        command.Parameters.AddWithValue("@DepartmentHead", ToDbValue(request.DepartmentHead));
        command.Parameters.AddWithValue("@ContactEmail", ToDbValue(request.ContactEmail));
        command.Parameters.AddWithValue("@ContactPhone", ToDbValue(request.ContactPhone));
        command.Parameters.AddWithValue("@Location", ToDbValue(request.Location));
        command.Parameters.AddWithValue("@Description", ToDbValue(request.Description));
    }

    private static DepartmentDto ReadDepartment(MySqlDataReader reader)
    {
        return new DepartmentDto(
            DepartmentId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("department_id"))),
            DepartmentCode: reader.GetString("department_code"),
            DepartmentName: reader.GetString("department_name"),
            DepartmentHead: GetNullableString(reader, "department_head"),
            ContactEmail: GetNullableString(reader, "contact_email"),
            ContactPhone: GetNullableString(reader, "contact_phone"),
            Location: GetNullableString(reader, "location"),
            Description: GetNullableString(reader, "description"),
            IsActive: reader.GetBoolean("is_active"));
    }

    private static string? GetNullableString(MySqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }

    private static object ToDbValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? DBNull.Value : value.Trim();
    }
}
