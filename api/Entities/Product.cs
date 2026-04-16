namespace AiMenu.Api.Entities;

// Product, menude satilan urunu temsil eder; AI tarafinda kullanilacak tag listesi de burada tutulur.
public class Product
{
    public Guid ProductId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
    public List<string> Tags { get; set; } = [];

    public Restaurant Restaurant { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
