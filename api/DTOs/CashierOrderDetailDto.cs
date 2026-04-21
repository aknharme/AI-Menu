namespace AiMenu.Api.DTOs;

public class CashierOrderDetailDto
{
    public Guid OrderId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid TableId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; set; }
    public decimal TotalAmount { get; set; }
    public IReadOnlyCollection<CashierOrderItemDto> Items { get; set; } = Array.Empty<CashierOrderItemDto>();
}
