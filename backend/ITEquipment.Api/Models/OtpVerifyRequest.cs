namespace ITEquipment.Api.Models;

public sealed record OtpVerifyRequest(string Email, string Purpose, string OtpCode);
