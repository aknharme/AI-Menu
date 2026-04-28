namespace AiMenu.Api.DTOs;

// AuditLogDto, admin panelin denetim listesindeki sade kayit modelidir.
public class AuditLogDto
{
    public Guid Id { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid? UserId { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}
