namespace AiMenu.Api.DTOs;

public class AdminCategoryDto
{
    public Guid CategoryId { get; set; }
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public int ProductCount { get; set; }
}
