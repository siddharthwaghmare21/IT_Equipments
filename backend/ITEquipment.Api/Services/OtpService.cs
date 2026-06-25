using System.Security.Cryptography;

namespace ITEquipment.Api.Services;

public sealed class OtpService(PasswordHashService passwordHashService)
{
    public string GenerateOtpCode()
    {
        return RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
    }

    public string HashOtp(string otpCode)
    {
        return passwordHashService.HashPassword(otpCode);
    }

    public bool VerifyOtp(string otpCode, string otpHash)
    {
        return passwordHashService.VerifyPassword(otpCode, otpHash);
    }
}
