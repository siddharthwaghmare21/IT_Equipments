namespace ITEquipment.Api.Models;

public sealed record OtpVerifyResponse(string Email, string Purpose, string Message);
