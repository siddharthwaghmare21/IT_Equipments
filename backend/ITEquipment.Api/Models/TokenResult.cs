namespace ITEquipment.Api.Models;

public sealed record TokenResult(
    string AccessToken,
    string TokenType,
    DateTimeOffset ExpiresAt);
