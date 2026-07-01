using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class SystemSettingRepository(MySqlConnectionFactory connectionFactory)
{
    private static readonly IReadOnlyDictionary<string, string> EditableReportSettings =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["company_name"] = "company",
            ["company_email"] = "company",
            ["company_phone"] = "company",
            ["company_address"] = "company",
            ["report_logo_text"] = "reports",
            ["report_prepared_by"] = "reports",
            ["report_classification"] = "reports"
        };

    public async Task<IReadOnlyList<SystemSettingDto>> GetPublicAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT setting_id, setting_group, setting_key, setting_value, value_type,
                   description, is_public, created_at, updated_at
            FROM system_settings
            WHERE is_public = TRUE
            ORDER BY setting_group, setting_key;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var settings = new List<SystemSettingDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            settings.Add(ReadSetting(reader));
        }

        return settings;
    }

    public async Task<IReadOnlyList<SystemSettingDto>> GetReportBrandingAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT setting_id, setting_group, setting_key, setting_value, value_type,
                   description, is_public, created_at, updated_at
            FROM system_settings
            WHERE (setting_group = 'company' AND setting_key IN ('company_name', 'company_email', 'company_phone', 'company_address'))
               OR (setting_group = 'reports' AND setting_key IN ('report_logo_text', 'report_prepared_by', 'report_classification'))
            ORDER BY setting_group, setting_key;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var settings = new List<SystemSettingDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            settings.Add(ReadSetting(reader));
        }

        return settings;
    }

    public async Task<IReadOnlyList<SystemSettingDto>> UpdateReportBrandingAsync(
        IReadOnlyList<SystemSettingUpdateRequest> updates,
        CancellationToken cancellationToken)
    {
        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        try
        {
            foreach (var update in updates)
            {
                if (!EditableReportSettings.TryGetValue(update.SettingKey, out var settingGroup))
                {
                    throw new InvalidOperationException($"Setting '{update.SettingKey}' is not editable here.");
                }

                await using var command = new MySqlCommand("""
                    UPDATE system_settings
                    SET setting_value = @SettingValue
                    WHERE setting_group = @SettingGroup
                      AND setting_key = @SettingKey;
                    """, connection, transaction);

                command.Parameters.AddWithValue("@SettingGroup", settingGroup);
                command.Parameters.AddWithValue("@SettingKey", update.SettingKey.Trim());
                command.Parameters.AddWithValue("@SettingValue", update.SettingValue ?? string.Empty);
                await command.ExecuteNonQueryAsync(cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        return await GetReportBrandingAsync(cancellationToken);
    }

    private static SystemSettingDto ReadSetting(MySqlDataReader reader)
    {
        return new SystemSettingDto(
            SettingId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("setting_id"))),
            SettingGroup: reader.GetString("setting_group"),
            SettingKey: reader.GetString("setting_key"),
            SettingValue: reader.IsDBNull(reader.GetOrdinal("setting_value"))
                ? null
                : reader.GetString("setting_value"),
            ValueType: reader.GetString("value_type"),
            Description: reader.IsDBNull(reader.GetOrdinal("description"))
                ? null
                : reader.GetString("description"),
            IsPublic: reader.GetBoolean("is_public"),
            CreatedAt: new DateTimeOffset(reader.GetDateTime("created_at")),
            UpdatedAt: new DateTimeOffset(reader.GetDateTime("updated_at")));
    }
}
