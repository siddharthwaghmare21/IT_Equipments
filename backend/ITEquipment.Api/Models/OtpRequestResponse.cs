namespace ITEquipment.Api.Models;

public sealed record OtpRequestResponse(
    long OtpRequestId,
    string Email,
    string Purpose,
    DateTimeOffset ExpiresAt,
    string Message,
    string? DevelopmentOtpCode = null);
