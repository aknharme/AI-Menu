using AiMenu.Api.DTOs;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services.Interfaces;

namespace AiMenu.Api.Services;

public class AdminStatsService(IAdminRepository adminRepository) : IAdminStatsService
{
    private const int DashboardRecentOrdersLimit = 6;
    private const int DashboardTopProductsLimit = 5;
    private const int DashboardTopRecommendationsLimit = 5;

    public async Task<DashboardSummaryDto?> GetDashboardSummaryAsync(
        Guid restaurantId,
        DateOnly? date,
        CancellationToken cancellationToken = default)
    {
        if (await adminRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var (startUtc, endUtc) = BuildDateRange(date);
        var totalOrderCount = await adminRepository.GetOrderCountAsync(restaurantId, startUtc, endUtc, cancellationToken);
        var pendingOrderCount = await adminRepository.GetPendingOrderCountAsync(restaurantId, startUtc, endUtc, cancellationToken);
        var recentOrders = await GetRecentOrdersAsync(restaurantId, date, cancellationToken) ?? [];
        var topProducts = await GetTopProductsAsync(restaurantId, date, cancellationToken) ?? [];
        var topRecommendedProducts = await GetRecommendationStatsAsync(restaurantId, date, cancellationToken) ?? [];

        return new DashboardSummaryDto
        {
            RestaurantId = restaurantId,
            Date = date,
            TotalOrderCount = totalOrderCount,
            PendingOrderCount = pendingOrderCount,
            RecentOrders = recentOrders.Take(DashboardRecentOrdersLimit).ToList(),
            TopProducts = topProducts.Take(DashboardTopProductsLimit).ToList(),
            PopularProducts = topProducts.Take(DashboardTopProductsLimit).ToList(),
            TopRecommendedProducts = topRecommendedProducts.Take(DashboardTopRecommendationsLimit).ToList()
        };
    }

    public async Task<IReadOnlyCollection<TopProductDto>?> GetTopProductsAsync(
        Guid restaurantId,
        DateOnly? date,
        CancellationToken cancellationToken = default)
    {
        if (await adminRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var (startUtc, endUtc) = BuildDateRange(date);
        var products = await adminRepository.GetTopOrderedProductsAsync(
            restaurantId,
            startUtc,
            endUtc,
            DashboardTopProductsLimit,
            cancellationToken);

        return products
            .Select(product => new TopProductDto
            {
                ProductId = product.ProductId,
                Name = product.Name,
                Count = product.Count
            })
            .ToList();
    }

    public async Task<IReadOnlyCollection<RecommendationStatDto>?> GetRecommendationStatsAsync(
        Guid restaurantId,
        DateOnly? date,
        CancellationToken cancellationToken = default)
    {
        if (await adminRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var (startUtc, endUtc) = BuildDateRange(date);
        var recommendations = await adminRepository.GetTopRecommendedProductsAsync(
            restaurantId,
            startUtc,
            endUtc,
            DashboardTopRecommendationsLimit,
            cancellationToken);

        return recommendations
            .Select(product => new RecommendationStatDto
            {
                ProductId = product.ProductId,
                Name = product.Name,
                RecommendationCount = product.Count
            })
            .ToList();
    }

    public async Task<IReadOnlyCollection<RecentOrderDto>?> GetRecentOrdersAsync(
        Guid restaurantId,
        DateOnly? date,
        CancellationToken cancellationToken = default)
    {
        if (await adminRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var (startUtc, endUtc) = BuildDateRange(date);
        var orders = await adminRepository.GetRecentOrdersAsync(
            restaurantId,
            startUtc,
            endUtc,
            DashboardRecentOrdersLimit,
            cancellationToken);

        return orders
            .Select(order => new RecentOrderDto
            {
                OrderId = order.OrderId,
                TableId = order.TableId,
                TableName = order.Table.Name,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                CreatedAtUtc = order.CreatedAtUtc
            })
            .ToList();
    }

    private static (DateTimeOffset? StartUtc, DateTimeOffset? EndUtc) BuildDateRange(DateOnly? date)
    {
        if (!date.HasValue)
        {
            return (null, null);
        }

        var start = date.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var end = date.Value.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        return (new DateTimeOffset(start), new DateTimeOffset(end));
    }
}
