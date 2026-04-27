namespace AiMenu.Api.DTOs;

// SaveAdminCategoryRequestDto, kategori ekleme ve guncelleme isteklerinde kullanilir.
public class SaveAdminCategoryRequestDto
{
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
