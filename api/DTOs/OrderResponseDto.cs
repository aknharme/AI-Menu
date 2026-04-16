namespace AiMenu.Api.DTOs;

public class OrderResponseDto
{
    public Guid OrderId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid TableId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public IReadOnlyCollection<OrderItemResponseDto> Items { get; set; } = Array.Empty<OrderItemResponseDto>();
}
