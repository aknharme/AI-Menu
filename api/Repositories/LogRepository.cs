using AiMenu.Api.Data;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Repositories;

public class LogRepository(AppDbContext dbContext) : ILogRepository
{
    public async Task<Restaurant?> GetRestaurantAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        // Log listeleme de sadece aktif restoranlar icin acik tutulur.
        return await dbContext.Restaurants
            .AsNoTracking()
            .FirstOrDefaultAsync(restaurant => restaurant.RestaurantId == restaurantId && restaurant.IsActive, cancellationToken);
    }

    public async Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken = default)
    {
        await dbContext.AuditLogs.AddAsync(auditLog, cancellationToken);
    }

    public async Task AddRecommendationLogAsync(RecommendationLog recommendationLog, CancellationToken cancellationToken = default)
    {
        await dbContext.RecommendationLogs.AddAsync(recommendationLog, cancellationToken);
    }

    public async Task AddOrderStatusLogAsync(OrderStatusLog orderStatusLog, CancellationToken cancellationToken = default)
    {
        await dbContext.OrderStatusLogs.AddAsync(orderStatusLog, cancellationToken);
    }

    public async Task<IReadOnlyCollection<AuditLog>> GetAuditLogsAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await dbContext.AuditLogs
            .AsNoTracking()
            .Where(log => log.RestaurantId == restaurantId)
            .OrderByDescending(log => log.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<RecommendationLog>> GetRecommendationLogsAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await dbContext.RecommendationLogs
            .AsNoTracking()
            .Where(log => log.RestaurantId == restaurantId)
            .OrderByDescending(log => log.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<OrderStatusLog>> GetOrderStatusLogsAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await dbContext.OrderStatusLogs
            .AsNoTracking()
            .Where(log => log.RestaurantId == restaurantId)
            .OrderByDescending(log => log.ChangedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
