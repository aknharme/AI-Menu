namespace AiMenu.Api.DTOs;

public class MenuResponseDto
{
    public Guid RestaurantId { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public string? TableName { get; set; }
    public IReadOnlyCollection<CategoryDto> Categories { get; set; } = Array.Empty<CategoryDto>();
}
