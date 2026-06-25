namespace ITEquipment.Api.Models;

public sealed record ApprovalDecisionRequest(long ApprovedByUserId, string? Remarks);
