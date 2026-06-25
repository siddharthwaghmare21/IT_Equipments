using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class VendorRepository(MySqlConnectionFactory connectionFactory)
{
    public async Task<IReadOnlyList<VendorDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT vendor_id, vendor_code, vendor_name, contact_person, contact_email,
                   contact_phone, gst_number, address, payment_terms, service_category,
                   compliance_status, is_active
            FROM vendors
            ORDER BY vendor_name;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var vendors = new List<VendorDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            vendors.Add(ReadVendor(reader));
        }

        return vendors;
    }

    public async Task<VendorDto?> GetByIdAsync(long vendorId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT vendor_id, vendor_code, vendor_name, contact_person, contact_email,
                   contact_phone, gst_number, address, payment_terms, service_category,
                   compliance_status, is_active
            FROM vendors
            WHERE vendor_id = @VendorId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@VendorId", vendorId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadVendor(reader) : null;
    }

    public async Task<VendorDto> CreateAsync(VendorCreateRequest request, CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO vendors (
                vendor_code, vendor_name, contact_person, contact_email, contact_phone,
                gst_number, address, payment_terms, service_category, compliance_status, is_active
            )
            VALUES (
                @VendorCode, @VendorName, @ContactPerson, @ContactEmail, @ContactPhone,
                @GstNumber, @Address, @PaymentTerms, @ServiceCategory, @ComplianceStatus, TRUE
            );
            SELECT LAST_INSERT_ID();
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        AddEditableParameters(command, request, request.ComplianceStatus ?? "Review Required");

        var newId = Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken));
        var vendor = await GetByIdAsync(newId, cancellationToken);
        return vendor ?? throw new InvalidOperationException("Vendor was created but could not be loaded.");
    }

    public async Task<VendorDto?> UpdateAsync(long vendorId, VendorUpdateRequest request, CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE vendors
            SET vendor_code = @VendorCode,
                vendor_name = @VendorName,
                contact_person = @ContactPerson,
                contact_email = @ContactEmail,
                contact_phone = @ContactPhone,
                gst_number = @GstNumber,
                address = @Address,
                payment_terms = @PaymentTerms,
                service_category = @ServiceCategory,
                compliance_status = @ComplianceStatus,
                is_active = @IsActive
            WHERE vendor_id = @VendorId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@VendorId", vendorId);
        AddEditableParameters(command, request, request.ComplianceStatus);
        command.Parameters.AddWithValue("@IsActive", request.IsActive);

        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        return affectedRows == 0 ? null : await GetByIdAsync(vendorId, cancellationToken);
    }

    public async Task<bool> DeactivateAsync(long vendorId, CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE vendors
            SET is_active = FALSE
            WHERE vendor_id = @VendorId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@VendorId", vendorId);

        return await command.ExecuteNonQueryAsync(cancellationToken) > 0;
    }

    private static void AddEditableParameters(MySqlCommand command, VendorCreateRequest request, string complianceStatus)
    {
        command.Parameters.AddWithValue("@VendorCode", request.VendorCode.Trim());
        command.Parameters.AddWithValue("@VendorName", request.VendorName.Trim());
        command.Parameters.AddWithValue("@ContactPerson", ToDbValue(request.ContactPerson));
        command.Parameters.AddWithValue("@ContactEmail", ToDbValue(request.ContactEmail));
        command.Parameters.AddWithValue("@ContactPhone", ToDbValue(request.ContactPhone));
        command.Parameters.AddWithValue("@GstNumber", ToDbValue(request.GstNumber));
        command.Parameters.AddWithValue("@Address", ToDbValue(request.Address));
        command.Parameters.AddWithValue("@PaymentTerms", ToDbValue(request.PaymentTerms));
        command.Parameters.AddWithValue("@ServiceCategory", ToDbValue(request.ServiceCategory));
        command.Parameters.AddWithValue("@ComplianceStatus", complianceStatus.Trim());
    }

    private static void AddEditableParameters(MySqlCommand command, VendorUpdateRequest request, string complianceStatus)
    {
        command.Parameters.AddWithValue("@VendorCode", request.VendorCode.Trim());
        command.Parameters.AddWithValue("@VendorName", request.VendorName.Trim());
        command.Parameters.AddWithValue("@ContactPerson", ToDbValue(request.ContactPerson));
        command.Parameters.AddWithValue("@ContactEmail", ToDbValue(request.ContactEmail));
        command.Parameters.AddWithValue("@ContactPhone", ToDbValue(request.ContactPhone));
        command.Parameters.AddWithValue("@GstNumber", ToDbValue(request.GstNumber));
        command.Parameters.AddWithValue("@Address", ToDbValue(request.Address));
        command.Parameters.AddWithValue("@PaymentTerms", ToDbValue(request.PaymentTerms));
        command.Parameters.AddWithValue("@ServiceCategory", ToDbValue(request.ServiceCategory));
        command.Parameters.AddWithValue("@ComplianceStatus", complianceStatus.Trim());
    }

    private static VendorDto ReadVendor(MySqlDataReader reader)
    {
        return new VendorDto(
            VendorId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("vendor_id"))),
            VendorCode: reader.GetString("vendor_code"),
            VendorName: reader.GetString("vendor_name"),
            ContactPerson: GetNullableString(reader, "contact_person"),
            ContactEmail: GetNullableString(reader, "contact_email"),
            ContactPhone: GetNullableString(reader, "contact_phone"),
            GstNumber: GetNullableString(reader, "gst_number"),
            Address: GetNullableString(reader, "address"),
            PaymentTerms: GetNullableString(reader, "payment_terms"),
            ServiceCategory: GetNullableString(reader, "service_category"),
            ComplianceStatus: reader.GetString("compliance_status"),
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
