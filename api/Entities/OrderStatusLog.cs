namespace AiMenu.Api.Entities;

// OrderStatusLog, siparisin olusturulmasi ve her durum degisimi icin kronolojik iz birakir.
public class OrderStatusLog
{
    public Guid OrderStatusLogId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid OrderId { get; set; }
    public string? OldStatus { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public Guid? ChangedByUserId { get; set; }
    public DateTimeOffset ChangedAtUtc { get; set; } = DateTimeOffset.UtcNow;

    public Restaurant Restaurant { get; set; } = null!;
    public Order Order { get; set; } = null!;
    public User? ChangedByUser { get; set; }
}
