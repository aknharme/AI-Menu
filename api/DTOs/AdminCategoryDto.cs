namespace AiMenu.Api.DTOs;

// AdminCategoryDto, admin panelin kategori listesi ve formu icin gereken alanlari tasir.
public class AdminCategoryDto
{
    public Guid CategoryId { get; set; }
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}
