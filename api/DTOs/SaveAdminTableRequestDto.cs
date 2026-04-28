using System.ComponentModel.DataAnnotations;
using AiMenu.Api.Validation;

namespace AiMenu.Api.DTOs;

// SaveAdminTableRequestDto, masa ekleme ve guncelleme isteklerini tasir.
public class SaveAdminTableRequestDto
{
    [NotEmptyGuid(ErrorMessage = "Restaurant id is required.")]
    public Guid RestaurantId { get; set; }

    [Required(ErrorMessage = "Table name is required.")]
    [MaxLength(80, ErrorMessage = "Table name cannot exceed 80 characters.")]
    public string Name { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}
