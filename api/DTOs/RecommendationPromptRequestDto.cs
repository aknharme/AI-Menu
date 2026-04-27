namespace AiMenu.Api.DTOs;

// RecommendationPromptRequestDto, once AI'den tag uretip sonra urun filtrelemek icin prompt tasir.
public class RecommendationPromptRequestDto
{
    public Guid RestaurantId { get; set; }
    public string Prompt { get; set; } = string.Empty;
}
