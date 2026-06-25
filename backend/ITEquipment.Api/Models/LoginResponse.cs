namespace ITEquipment.Api.Models;

public sealed record LoginResponse(
    UserDto User,
    string Message,
    bool RequiresPasswordChange = false);
