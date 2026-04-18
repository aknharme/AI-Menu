namespace AiMenu.Api.DTOs;

public class MenuResponseDto
{
    public Guid RestaurantId { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public IReadOnlyCollection<MenuCategoryDto> Categories { get; set; } = Array.Empty<MenuCategoryDto>();
}
