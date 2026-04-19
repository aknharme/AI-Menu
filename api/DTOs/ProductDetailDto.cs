namespace AiMenu.Api.DTOs;

// Ürün detay endpoint'inde açıklama, içerik, alerjen, tag ve varyantları birlikte döndürür.
public class ProductDetailDto
{
    public Guid ProductId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Ingredients { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public IReadOnlyCollection<string> Allergens { get; set; } = Array.Empty<string>();
    public IReadOnlyCollection<string> Tags { get; set; } = Array.Empty<string>();
    public IReadOnlyCollection<ProductVariantDto> Variants { get; set; } = Array.Empty<ProductVariantDto>();
}
