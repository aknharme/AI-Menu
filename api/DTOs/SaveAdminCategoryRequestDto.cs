using System.ComponentModel.DataAnnotations;
using AiMenu.Api.Validation;

namespace AiMenu.Api.DTOs;

// SaveAdminCategoryRequestDto, kategori ekleme ve guncelleme isteklerinde kullanilir.
public class SaveAdminCategoryRequestDto
{
    [NotEmptyGuid(ErrorMessage = "Restaurant id is required.")]
    public Guid RestaurantId { get; set; }

    [Required(ErrorMessage = "Category name is required.")]
    [MaxLength(120, ErrorMessage = "Category name cannot exceed 120 characters.")]
    public string Name { get; set; } = string.Empty;

    [Range(0, 1000, ErrorMessage = "Display order must be between 0 and 1000.")]
    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;
}
