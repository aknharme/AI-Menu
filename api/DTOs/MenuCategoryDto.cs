namespace AiMenu.Api.DTOs;

public class MenuCategoryDto
{
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public IReadOnlyCollection<MenuProductDto> Products { get; set; } = Array.Empty<MenuProductDto>();
}
