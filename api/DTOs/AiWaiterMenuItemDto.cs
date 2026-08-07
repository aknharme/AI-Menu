namespace AiMenu.Api.DTOs;

// AiWaiterMenuItemDto, modele gonderilecek sade ve guvenilir menu satiridir.
public class AiWaiterMenuItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Ingredients { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int? Calories { get; set; }
    public int? PreparationTimeMinutes { get; set; }
    public string Category { get; set; } = string.Empty;
    public IReadOnlyCollection<string> Allergens { get; set; } = Array.Empty<string>();
    public IReadOnlyCollection<string> Tags { get; set; } = Array.Empty<string>();
    public IReadOnlyCollection<AiWaiterMenuVariantDto> Variants { get; set; } = Array.Empty<AiWaiterMenuVariantDto>();
}
