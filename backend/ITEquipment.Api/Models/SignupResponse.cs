namespace ITEquipment.Api.Models;

public sealed record SignupResponse(
    UserDto User,
    long ApprovalRequestId,
    string Message);
