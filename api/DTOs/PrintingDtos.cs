using System.ComponentModel.DataAnnotations;

namespace AiMenu.Api.DTOs;

public record TicketLine(string ProductName, int Quantity, string Variant, string Note);
public record KitchenTicket(int SchemaVersion, Guid OrderId, string RestaurantName, string TableName,
    DateTimeOffset OrderedAtUtc, string Station, string Note, IReadOnlyList<TicketLine> Items);
public record PrintJobDelivery(Guid Id, Guid LeaseId, DateTimeOffset LeaseExpiresAtUtc, int Attempt, KitchenTicket Ticket);
public record PairingCodeResponse(string Code, DateTimeOffset ExpiresAtUtc);
public record PairDeviceResponse(Guid DeviceId, Guid RestaurantId, string DeviceToken);

public class PairDeviceRequest
{
    [Required, StringLength(20)] public string Code { get; set; } = "";
    [Required, StringLength(80)] public string Name { get; set; } = "";
}
public class PrintResultRequest
{
    public Guid LeaseId { get; set; }
    [Required, RegularExpression("^(Submitted|Simulated|Failed|Uncertain)$")]
    public string Result { get; set; } = "";
    [StringLength(300)] public string? Error { get; set; }
}
public class PrintRouteRequest
{
    public Guid CategoryId { get; set; }
    [Required, RegularExpression("^(Kitchen|Bar)$")] public string Station { get; set; } = "Kitchen";
}
public class PrintSettingsRequest
{
    public bool Enabled { get; set; }
    [Required, MaxLength(300)] public List<PrintRouteRequest> Routes { get; set; } = [];
}
public class RetryPrintRequest
{
    [Range(1, int.MaxValue)] public int ExpectedAttempt { get; set; }
    public bool AcknowledgeDuplicateRisk { get; set; }
}
