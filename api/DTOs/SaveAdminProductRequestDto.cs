using System.ComponentModel.DataAnnotations;
using AiMenu.Api.Validation;

namespace AiMenu.Api.DTOs;

// SaveAdminProductRequestDto, urun ekleme ve guncelleme formundan gelen degerleri tasir.
public class SaveAdminProductRequestDto
{
    [NotEmptyGuid(ErrorMessage = "Restaurant id is required.")]
    public Guid RestaurantId { get; set; }

    [NotEmptyGuid(ErrorMessage = "Category id is required.")]
    public Guid CategoryId { get; set; }

    [Required(ErrorMessage = "Product name is required.")]
    [MaxLength(150, ErrorMessage = "Product name cannot exceed 150 characters.")]
    public string Name { get; set; } = string.Empty;

    [Range(0, 100000, ErrorMessage = "Price must be between 0 and 100000.")]
    public decimal Price { get; set; }

    [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
    public string Description { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Content cannot exceed 500 characters.")]
    public string Content { get; set; } = string.Empty;

    public IReadOnlyCollection<string> Tags { get; set; } = Array.Empty<string>();

    public bool IsActive { get; set; } = true;
}
