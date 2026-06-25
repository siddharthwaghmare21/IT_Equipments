namespace ITEquipment.Api.Models;

public sealed record OtpRecord(
    long OtpRequestId,
    long? UserId,
    string Email,
    string Purpose,
    string OtpHash,
    DateTimeOffset ExpiresAt,
    DateTimeOffset? VerifiedAt,
    int Attempts,
    int MaxAttempts,
    bool IsUsed);
