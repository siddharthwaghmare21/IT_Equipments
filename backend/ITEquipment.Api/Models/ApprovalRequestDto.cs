namespace ITEquipment.Api.Models;

public sealed record ApprovalRequestDto(
    long ApprovalRequestId,
    string RequestType,
    string? EntityName,
    long? EntityId,
    long? RequestedBy,
    string? RequestedUserName,
    string? RequestedUserEmail,
    long? RequestedRoleId,
    string? RequestedRoleCode,
    string? RequestedRoleName,
    string ApprovalStatus,
    long? ApprovedBy,
    DateTimeOffset? ApprovedAt,
    string? Remarks,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
