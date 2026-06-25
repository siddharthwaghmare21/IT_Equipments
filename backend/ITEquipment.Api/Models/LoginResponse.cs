namespace ITEquipment.Api.Models;

public sealed record LoginResponse(
    UserDto User,
    string Message,
    TokenResult? Token = null,
    bool RequiresPasswordChange = false);
