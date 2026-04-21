namespace AiMenu.Api.DTOs;

public class CashierOrderListDto
{
    public Guid OrderId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid TableId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; set; }
    public decimal TotalAmount { get; set; }
    public int ItemCount { get; set; }
}
