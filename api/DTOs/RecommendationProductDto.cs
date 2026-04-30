namespace AiMenu.Api.DTOs;

// RecommendationProductDto, onerilen urunun kart listesinde gereken sade alanlarini tasir.
public class RecommendationProductDto
{
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
}
