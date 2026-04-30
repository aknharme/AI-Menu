namespace AiMenu.Api.DTOs;

// RecommendationStatDto, onerilerde en cok gecen urunlerin sayisini tasir.
public class RecommendationStatDto
{
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int RecommendationCount { get; set; }
}
