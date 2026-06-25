namespace ITEquipment.Api.Security;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } = "ITEquipment.Api";

    public string Audience { get; init; } = "ITEquipment.Frontend";

    public string SigningKey { get; init; } = string.Empty;

    public int ExpiryMinutes { get; init; } = 480;
}
