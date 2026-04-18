namespace AiMenu.Api.Entities;

public class Order
{
    public Guid OrderId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid TableId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public decimal TotalAmount { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

    public Restaurant Restaurant { get; set; } = null!;
    public Table Table { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
