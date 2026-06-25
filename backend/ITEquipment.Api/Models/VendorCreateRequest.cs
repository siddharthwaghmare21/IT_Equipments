namespace ITEquipment.Api.Models;

public sealed record VendorCreateRequest(
    string VendorCode,
    string VendorName,
    string? ContactPerson,
    string? ContactEmail,
    string? ContactPhone,
    string? GstNumber,
    string? Address,
    string? PaymentTerms,
    string? ServiceCategory,
    string? ComplianceStatus);
