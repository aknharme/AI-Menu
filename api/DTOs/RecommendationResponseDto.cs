namespace AiMenu.Api.DTOs;

// RecommendationResponseDto, tag kaynagi ve fallback bilgisiyle birlikte onerilen urunleri doner.
public class RecommendationResponseDto
{
    public Guid RestaurantId { get; set; }
    public IReadOnlyCollection<string> Tags { get; set; } = Array.Empty<string>();
    public bool IsFallback { get; set; }
    public string Message { get; set; } = string.Empty;
    public IReadOnlyCollection<RecommendationProductDto> Products { get; set; } = Array.Empty<RecommendationProductDto>();
}
