using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ITEquipment.Api.Models;
using ITEquipment.Api.Security;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ITEquipment.Api.Services;

public sealed class JwtTokenService(IOptions<JwtOptions> jwtOptions)
{
    public TokenResult CreateToken(UserDto user)
    {
        var options = jwtOptions.Value;
        if (string.IsNullOrWhiteSpace(options.SigningKey) || options.SigningKey.Length < 32)
        {
            throw new InvalidOperationException("JWT signing key must be configured with at least 32 characters.");
        }

        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(Math.Max(options.ExpiryMinutes, 15));
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.RoleCode),
            new("role_code", user.RoleCode),
            new("role_name", user.RoleName)
        };

        if (user.DepartmentId.HasValue)
        {
            claims.Add(new Claim("department_id", user.DepartmentId.Value.ToString()));
        }

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.SigningKey)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: options.Issuer,
            audience: options.Audience,
            claims: claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);

        return new TokenResult(
            new JwtSecurityTokenHandler().WriteToken(token),
            "Bearer",
            expiresAt);
    }
}
