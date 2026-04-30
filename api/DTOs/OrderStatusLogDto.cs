namespace AiMenu.Api.DTOs;

// OrderStatusLogDto, siparis gecmisindeki olusturma ve durum degisimi adimlarini tasir.
public class OrderStatusLogDto
{
    public Guid Id { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid OrderId { get; set; }
    public string? OldStatus { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public Guid? ChangedByUserId { get; set; }
    public DateTimeOffset ChangedAt { get; set; }
}
