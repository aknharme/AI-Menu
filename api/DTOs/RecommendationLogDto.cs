namespace AiMenu.Api.DTOs;

// RecommendationLogDto, prompt ve cikan onerilerin admin tarafinda okunabilir halidir.
public class RecommendationLogDto
{
    public Guid Id { get; set; }
    public Guid RestaurantId { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public IReadOnlyCollection<string> ExtractedTags { get; set; } = Array.Empty<string>();
    public IReadOnlyCollection<Guid> RecommendedProducts { get; set; } = Array.Empty<Guid>();
    public DateTimeOffset CreatedAt { get; set; }
}
