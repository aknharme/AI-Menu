using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

// IAdminStatsService, admin panel dashboard'u icin temel analitik verileri uretir.
public interface IAdminStatsService
{
    Task<DashboardSummaryDto?> GetDashboardSummaryAsync(Guid restaurantId, DateOnly? date, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<TopProductDto>?> GetTopProductsAsync(Guid restaurantId, DateOnly? date, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<RecommendationStatDto>?> GetRecommendationStatsAsync(Guid restaurantId, DateOnly? date, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<RecentOrderDto>?> GetRecentOrdersAsync(Guid restaurantId, DateOnly? date, CancellationToken cancellationToken = default);
}
