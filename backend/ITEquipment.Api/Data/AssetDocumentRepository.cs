using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class AssetDocumentRepository(MySqlConnectionFactory connectionFactory)
{
    public async Task<IReadOnlyList<AssetDocumentDto>> GetByAssetIdAsync(long assetId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT document_id, asset_id, document_type, file_name, file_path,
                   file_size_bytes, mime_type, uploaded_by, uploaded_at
            FROM asset_documents
            WHERE asset_id = @AssetId
            ORDER BY uploaded_at DESC, document_id DESC;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@AssetId", assetId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var documents = new List<AssetDocumentDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            documents.Add(ReadDocument(reader));
        }

        return documents;
    }

    public async Task<AssetDocumentDto> CreateAsync(
        long assetId,
        AssetDocumentCreateRequest request,
        string documentType,
        CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO asset_documents (
                asset_id, document_type, file_name, file_path,
                file_size_bytes, mime_type, uploaded_by
            )
            VALUES (
                @AssetId, @DocumentType, @FileName, @FilePath,
                @FileSizeBytes, @MimeType, @UploadedBy
            );
            SELECT LAST_INSERT_ID();
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@AssetId", assetId);
        command.Parameters.AddWithValue("@DocumentType", documentType.Trim());
        command.Parameters.AddWithValue("@FileName", request.FileName.Trim());
        command.Parameters.AddWithValue("@FilePath", ToDbValue(request.FilePath));
        command.Parameters.AddWithValue("@FileSizeBytes", ToDbValue(request.FileSizeBytes));
        command.Parameters.AddWithValue("@MimeType", ToDbValue(request.MimeType));
        command.Parameters.AddWithValue("@UploadedBy", ToDbValue(request.UploadedBy));

        var newId = Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken));
        return await GetByIdAsync(newId, cancellationToken)
            ?? throw new InvalidOperationException("Asset document was created but could not be loaded.");
    }

    public async Task<bool> DeleteAsync(long assetId, long documentId, CancellationToken cancellationToken)
    {
        const string sql = """
            DELETE FROM asset_documents
            WHERE asset_id = @AssetId
              AND document_id = @DocumentId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@AssetId", assetId);
        command.Parameters.AddWithValue("@DocumentId", documentId);

        return await command.ExecuteNonQueryAsync(cancellationToken) > 0;
    }

    private async Task<AssetDocumentDto?> GetByIdAsync(long documentId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT document_id, asset_id, document_type, file_name, file_path,
                   file_size_bytes, mime_type, uploaded_by, uploaded_at
            FROM asset_documents
            WHERE document_id = @DocumentId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@DocumentId", documentId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadDocument(reader) : null;
    }

    private static AssetDocumentDto ReadDocument(MySqlDataReader reader)
    {
        return new AssetDocumentDto(
            DocumentId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("document_id"))),
            AssetId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("asset_id"))),
            DocumentType: reader.GetString("document_type"),
            FileName: reader.GetString("file_name"),
            FilePath: GetNullableString(reader, "file_path"),
            FileSizeBytes: GetNullableInt64(reader, "file_size_bytes"),
            MimeType: GetNullableString(reader, "mime_type"),
            UploadedBy: GetNullableInt64(reader, "uploaded_by"),
            UploadedAt: GetDateTimeOffset(reader, "uploaded_at"));
    }

    private static string? GetNullableString(MySqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }

    private static long? GetNullableInt64(MySqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal)
            ? null
            : Convert.ToInt64(reader.GetValue(ordinal));
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
