using System.ComponentModel.DataAnnotations;

namespace AiMenu.Api.DTOs;

public class AdminAiTestRequestDto
{
    public Guid RestaurantId { get; set; }

    [Required(ErrorMessage = "Message is required.")]
    [StringLength(300, MinimumLength = 1, ErrorMessage = "Message must be between 1 and 300 characters.")]
    public string Message { get; set; } = string.Empty;
}
