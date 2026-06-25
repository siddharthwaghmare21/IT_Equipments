namespace ITEquipment.Api.Models;

public sealed record ApprovalDecisionResponse(
    long ApprovalRequestId,
    long UserId,
    string ApprovalStatus,
    string AccountStatus,
    string Message);
