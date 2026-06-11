using System.ComponentModel.DataAnnotations;

namespace AiMenu.Api.DTOs;

public class UpdateAdminProductRequestDto
{
    [Required]
    public Guid RestaurantId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Range(0.01, 999999)]
    public decimal Price { get; set; }

    [Required]
    public Guid CategoryId { get; set; }

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Content { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}
