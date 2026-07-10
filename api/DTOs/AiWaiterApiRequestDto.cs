namespace AiMenu.Api.DTOs;

// AiWaiterApiRequestDto, AI Menu Backend'in guvenilir DB menusunu AiWaiterApi'ye tasidigi internal sozlesmedir.
public class AiWaiterApiRequestDto
{
    public Guid RestaurantId { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public string CustomerMessage { get; set; } = string.Empty;
    public IReadOnlyCollection<AiWaiterMenuItemDto> Menu { get; set; } = Array.Empty<AiWaiterMenuItemDto>();
    public IReadOnlyCollection<string> Rules { get; set; } = Array.Empty<string>();
}
