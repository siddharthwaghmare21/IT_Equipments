namespace ITEquipment.Api.Models;

public sealed record AssetCreateRequest(
    string AssetTag,
    string AssetName,
    string Category,
    string? Brand,
    string? Model,
    string SerialNumber,
    string? WorkOrderRef,
    string? InvoiceNumber,
    DateOnly? PurchaseDate,
    DateOnly? WarrantyExpiry,
    long? CustodianDepartmentId,
    long? CurrentDepartmentId,
    string? CurrentReceiverName,
    string? Location,
    string? AssetCondition,
    string? LifecycleStatus,
    string? AssetStatus,
    string? QrCode,
    string? Specifications,
    string? Description,
    string? Remarks);
