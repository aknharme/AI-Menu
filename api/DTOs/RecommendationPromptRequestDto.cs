using System.ComponentModel.DataAnnotations;

namespace AiMenu.Api.DTOs;

// RecommendationPromptRequestDto, once AI'den tag uretip sonra urun filtrelemek icin prompt tasir.
public class RecommendationPromptRequestDto
{
    public Guid RestaurantId { get; set; }

    [Required(ErrorMessage = "Prompt is required.")]
    [StringLength(300, MinimumLength = 1, ErrorMessage = "Prompt must be between 1 and 300 characters.")]
    public string Prompt { get; set; } = string.Empty;
}
