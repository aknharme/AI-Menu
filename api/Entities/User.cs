namespace AiMenu.Api.Entities;

// User, admin ve cashier kimlik bilgisini ve restoran bagini tutar.
public class User
{
    public Guid UserId { get; set; }
    public Guid RestaurantId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

    public Restaurant Restaurant { get; set; } = null!;
    // Kullanici bazli admin ve siparis degisiklikleri buradan izlenebilir.
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    public ICollection<OrderStatusLog> OrderStatusLogs { get; set; } = new List<OrderStatusLog>();
}
