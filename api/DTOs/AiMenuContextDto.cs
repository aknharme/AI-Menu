namespace AiMenu.Api.DTOs;

public class AiMenuContextDto
{
    public Guid RestaurantId { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public IReadOnlyCollection<AiMenuProductContextDto> Products { get; set; } = Array.Empty<AiMenuProductContextDto>();
}
