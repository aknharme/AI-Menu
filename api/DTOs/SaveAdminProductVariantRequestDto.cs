using System.ComponentModel.DataAnnotations;

namespace AiMenu.Api.DTOs;

// SaveAdminProductVariantRequestDto, urun kaydederken opsiyonel varyant satirlarini tasir.
public class SaveAdminProductVariantRequestDto
{
    public Guid? ProductVariantId { get; set; }

    [MaxLength(120, ErrorMessage = "Variant name cannot exceed 120 characters.")]
    public string Name { get; set; } = string.Empty;

    [Range(-100000, 100000, ErrorMessage = "Variant price delta must be between -100000 and 100000.")]
    public decimal PriceDelta { get; set; }

    public bool IsActive { get; set; } = true;
}
