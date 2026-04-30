using AiMenu.Api.Entities;

namespace AiMenu.Api.Repositories.Interfaces;

// ILogRepository, audit ve is akisi loglarinin veri erisim katmanini toplar.
public interface ILogRepository
{
    Task<Restaurant?> GetRestaurantAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken = default);
    Task AddRecommendationLogAsync(RecommendationLog recommendationLog, CancellationToken cancellationToken = default);
    Task AddOrderStatusLogAsync(OrderStatusLog orderStatusLog, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<AuditLog>> GetAuditLogsAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<RecommendationLog>> GetRecommendationLogsAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<OrderStatusLog>> GetOrderStatusLogsAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
