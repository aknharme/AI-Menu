namespace AiMenu.Api.DTOs;

public class AdminTableDto
{
    public Guid TableId { get; set; }
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string MenuUrl { get; set; } = string.Empty;
    public string QrCodeValue { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
