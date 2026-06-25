using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class MySqlConnectionFactory(IConfiguration configuration)
{
    private const string PlaceholderPassword = "__SET_IN_USER_SECRETS_OR_LOCAL_FILE__";

    public MySqlConnection CreateConnection()
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString) ||
            connectionString.Contains(PlaceholderPassword, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("DefaultConnection is not configured.");
        }

        return new MySqlConnection(connectionString);
    }
}
