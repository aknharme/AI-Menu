namespace AiMenu.Api.DTOs;

// SaveAdminTableRequestDto, masa ekleme ve guncelleme isteklerini tasir.
public class SaveAdminTableRequestDto
{
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
