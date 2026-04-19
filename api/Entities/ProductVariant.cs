namespace AiMenu.Api.Entities;

// ProductVariant, aynı ürünün fiyat farkı olan seçeneklerini temsil eder.
public class ProductVariant
{
    public Guid ProductVariantId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PriceDelta { get; set; } // Ana ürün fiyatına eklenecek fark.
    public bool IsActive { get; set; } = true;

    public Restaurant Restaurant { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
