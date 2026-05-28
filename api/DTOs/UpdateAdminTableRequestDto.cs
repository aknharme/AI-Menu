using System.ComponentModel.DataAnnotations;

namespace AiMenu.Api.DTOs;

public class UpdateAdminTableRequestDto
{
    [Required]
    public Guid RestaurantId { get; set; }

    [Required]
    [MaxLength(80)]
    public string Name { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}
