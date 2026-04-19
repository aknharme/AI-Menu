namespace AiMenu.Api.DTOs;

// Ürün varyantının müşteri tarafında gösterilecek fiyat etkisini taşır.
public class ProductVariantDto
{
    public Guid ProductVariantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PriceDelta { get; set; }
    public decimal FinalPrice { get; set; }
}
