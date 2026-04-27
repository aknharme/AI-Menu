namespace AiMenu.Api.DTOs;

// SaveAdminProductRequestDto, urun ekleme ve guncelleme formundan gelen degerleri tasir.
public class SaveAdminProductRequestDto
{
    public Guid RestaurantId { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
