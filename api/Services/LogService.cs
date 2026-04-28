using System.Security.Claims;
using System.Text.Json;
using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Http;

namespace AiMenu.Api.Services;

public class LogService(
    ILogRepository logRepository,
    IHttpContextAccessor httpContextAccessor) : ILogService
{
    public async Task LogAuditAsync(
        Guid restaurantId,
        string actionType,
        string entityType,
        Guid entityId,
        string description,
        CancellationToken cancellationToken = default)
    {
        var auditLog = new AuditLog
        {
            AuditLogId = Guid.NewGuid(),
            RestaurantId = restaurantId,
            UserId = GetCurrentUserId(),
            ActionType = actionType,
            EntityType = entityType,
            EntityId = entityId,
            Description = description,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };

        await logRepository.AddAuditLogAsync(auditLog, cancellationToken);
        await logRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task LogRecommendationAsync(
        Guid restaurantId,
        string prompt,
        IReadOnlyCollection<string> extractedTags,
        IReadOnlyCollection<Guid> recommendedProductIds,
        CancellationToken cancellationToken = default)
    {
        var recommendationLog = new RecommendationLog
        {
            RecommendationLogId = Guid.NewGuid(),
            RestaurantId = restaurantId,
            Prompt = prompt,
            ExtractedTags = JsonSerializer.Serialize(extractedTags),
            RecommendedProducts = JsonSerializer.Serialize(recommendedProductIds),
            CreatedAtUtc = DateTimeOffset.UtcNow
        };

        await logRepository.AddRecommendationLogAsync(recommendationLog, cancellationToken);
        await logRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task LogOrderStatusAsync(
        Guid restaurantId,
        Guid orderId,
        string? oldStatus,
        string newStatus,
        Guid? changedByUserId = null,
        CancellationToken cancellationToken = default)
    {
        var orderStatusLog = new OrderStatusLog
        {
            OrderStatusLogId = Guid.NewGuid(),
            RestaurantId = restaurantId,
            OrderId = orderId,
            OldStatus = oldStatus,
            NewStatus = newStatus,
            ChangedByUserId = changedByUserId ?? GetCurrentUserId(),
            ChangedAtUtc = DateTimeOffset.UtcNow
        };

        await logRepository.AddOrderStatusLogAsync(orderStatusLog, cancellationToken);
        await logRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<AuditLogDto>?> GetAuditLogsAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        if (await logRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var logs = await logRepository.GetAuditLogsAsync(restaurantId, cancellationToken);
        return logs
            .Select(log => new AuditLogDto
            {
                Id = log.AuditLogId,
                RestaurantId = log.RestaurantId,
                UserId = log.UserId,
                ActionType = log.ActionType,
                EntityType = log.EntityType,
                EntityId = log.EntityId,
                Description = log.Description,
                CreatedAt = log.CreatedAtUtc
            })
            .ToList();
    }

    public async Task<IReadOnlyCollection<RecommendationLogDto>?> GetRecommendationLogsAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        if (await logRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var logs = await logRepository.GetRecommendationLogsAsync(restaurantId, cancellationToken);
        return logs
            .Select(log => new RecommendationLogDto
            {
                Id = log.RecommendationLogId,
                RestaurantId = log.RestaurantId,
                Prompt = log.Prompt,
                ExtractedTags = DeserializeStrings(log.ExtractedTags),
                RecommendedProducts = DeserializeGuids(log.RecommendedProducts),
                CreatedAt = log.CreatedAtUtc
            })
            .ToList();
    }

    public async Task<IReadOnlyCollection<OrderStatusLogDto>?> GetOrderStatusLogsAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        if (await logRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var logs = await logRepository.GetOrderStatusLogsAsync(restaurantId, cancellationToken);
        return logs
            .Select(log => new OrderStatusLogDto
            {
                Id = log.OrderStatusLogId,
                RestaurantId = log.RestaurantId,
                OrderId = log.OrderId,
                OldStatus = log.OldStatus,
                NewStatus = log.NewStatus,
                ChangedByUserId = log.ChangedByUserId,
                ChangedAt = log.ChangedAtUtc
            })
            .ToList();
    }

    private Guid? GetCurrentUserId()
    {
        // JWT claim'i varsa log kaydi yapan kullaniciya otomatik baglanir.
        var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    private static IReadOnlyCollection<string> DeserializeStrings(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? [];
        }
        catch
        {
            return [];
        }
    }

    private static IReadOnlyCollection<Guid> DeserializeGuids(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<List<Guid>>(json) ?? [];
        }
        catch
        {
            return [];
        }
    }
}
