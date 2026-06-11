using System.ComponentModel.DataAnnotations;

namespace AiMenu.Api.DTOs;

public class UpdateAdminCategoryRequestDto
{
    [Required]
    public Guid RestaurantId { get; set; }

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [Range(0, 999)]
    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;
}
