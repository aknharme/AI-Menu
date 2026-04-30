namespace AiMenu.Api.DTOs;

// RecentOrderDto, dashboard'daki son siparisler listesini sade sekilde besler.
public class RecentOrderDto
{
    public Guid OrderId { get; set; }
    public Guid TableId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
}
