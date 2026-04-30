namespace AiMenu.Api.Entities;

// AuditLog, admin veya yetkili kullanicinin yaptigi kritik veri degisikliklerini kaydeder.
public class AuditLog
{
    public Guid AuditLogId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid? UserId { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

    public Restaurant Restaurant { get; set; } = null!;
    public User? User { get; set; }
}
