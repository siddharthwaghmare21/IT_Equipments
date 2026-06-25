namespace ITEquipment.Api.Models;

public sealed record LoginUserRecord(UserDto User, string PasswordHash);
