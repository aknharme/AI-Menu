namespace AiMenu.Api.DTOs;

// AdminTableDto, admin panelde masa ve QR bilgisini gostermek icin kullanilir.
public class AdminTableDto
{
    public Guid TableId { get; set; }
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string MenuUrl { get; set; } = string.Empty;
}
