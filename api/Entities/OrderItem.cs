namespace AiMenu.Api.Entities;

// OrderItem, bir siparisin icindeki tekil urun satiridir.
public class OrderItem
{
    public Guid OrderItemId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }

    public Restaurant Restaurant { get; set; } = null!;
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
