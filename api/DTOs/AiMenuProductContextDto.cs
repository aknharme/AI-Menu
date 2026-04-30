namespace AiMenu.Api.DTOs;

public class AiMenuProductContextDto
{
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Ingredients { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public IReadOnlyCollection<string> Allergens { get; set; } = Array.Empty<string>();
    public IReadOnlyCollection<string> Tags { get; set; } = Array.Empty<string>();
    public IReadOnlyCollection<string> Variants { get; set; } = Array.Empty<string>();
}
