using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

// ILogService, kritik olaylari kaydetmek ve admin tarafina listelemek icin tekrar kullanilabilir giris noktasi sunar.
public interface ILogService
{
    Task LogAuditAsync(Guid restaurantId, string actionType, string entityType, Guid entityId, string description, CancellationToken cancellationToken = default);
    Task LogRecommendationAsync(Guid restaurantId, string prompt, IReadOnlyCollection<string> extractedTags, IReadOnlyCollection<Guid> recommendedProductIds, CancellationToken cancellationToken = default);
    Task LogOrderStatusAsync(Guid restaurantId, Guid orderId, string? oldStatus, string newStatus, Guid? changedByUserId = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<AuditLogDto>?> GetAuditLogsAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<RecommendationLogDto>?> GetRecommendationLogsAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<OrderStatusLogDto>?> GetOrderStatusLogsAsync(Guid restaurantId, CancellationToken cancellationToken = default);
}
