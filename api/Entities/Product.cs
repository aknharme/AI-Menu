namespace AiMenu.Api.Entities;

// Product, menude satilan urunu temsil eder; AI tarafinda kullanilacak tag listesi de burada tutulur.
public class Product
{
    public Guid ProductId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    // İçerik bilgisi ürün detayında müşteriye açık şekilde gösterilir.
    public string Ingredients { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;

    public Restaurant Restaurant { get; set; } = null!;
    public Category Category { get; set; } = null!;
    // Varyant, alerjen ve tag bilgileri ürün detay response'unu besler.
    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<ProductAllergen> Allergens { get; set; } = new List<ProductAllergen>();
    public ICollection<ProductTag> Tags { get; set; } = new List<ProductTag>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
