namespace AiMenu.Api.Entities;

// RecommendationLog, AI tag uretimi ve sonucunda donen urun onerilerini tek kayitta saklar.
public class RecommendationLog
{
    public Guid RecommendationLogId { get; set; }
    public Guid RestaurantId { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public string ExtractedTags { get; set; } = "[]";
    public string RecommendedProducts { get; set; } = "[]";
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

    public Restaurant Restaurant { get; set; } = null!;
}
