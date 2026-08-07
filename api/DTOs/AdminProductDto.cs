namespace AiMenu.Api.DTOs;

// AdminProductDto, admin panelde urun listeleme ve duzenleme icin gerekli alanlari dondurur.
public class AdminProductDto
{
    public Guid ProductId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int? Calories { get; set; }
    public int? PreparationTimeMinutes { get; set; }
    public IReadOnlyCollection<string> Allergens { get; set; } = Array.Empty<string>();
    public IReadOnlyCollection<string> Tags { get; set; } = Array.Empty<string>();
    public IReadOnlyCollection<AdminProductVariantDto> Variants { get; set; } = Array.Empty<AdminProductVariantDto>();
    public bool IsActive { get; set; }
}
