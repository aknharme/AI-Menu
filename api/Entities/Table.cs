namespace AiMenu.Api.Entities;

public class Table
{
    public Guid TableId { get; set; }
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string QrCodeValue { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public Restaurant Restaurant { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
