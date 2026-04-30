using System.Security.Claims;
using AiMenu.Api.Constants;
using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/admin/logs")]
// AdminLogsController, restoran bazli audit ve islem loglarini admin paneline sunar.
[Authorize(Roles = AppRoles.Admin)]
public class AdminLogsController(ILogService logService) : ControllerBase
{
    [HttpGet("audit/{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<AuditLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAuditLogs(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (!IsRestaurantAccessAllowed(restaurantId))
        {
            return Forbid();
        }

        var logs = await logService.GetAuditLogsAsync(restaurantId, cancellationToken);
        return logs is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Ok(logs);
    }

    [HttpGet("recommendations/{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<RecommendationLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRecommendationLogs(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (!IsRestaurantAccessAllowed(restaurantId))
        {
            return Forbid();
        }

        var logs = await logService.GetRecommendationLogsAsync(restaurantId, cancellationToken);
        return logs is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Ok(logs);
    }

    [HttpGet("orders/{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<OrderStatusLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrderLogs(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (!IsRestaurantAccessAllowed(restaurantId))
        {
            return Forbid();
        }

        var logs = await logService.GetOrderStatusLogsAsync(restaurantId, cancellationToken);
        return logs is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Ok(logs);
    }

    private bool IsRestaurantAccessAllowed(Guid restaurantId)
    {
        // Admin token'indaki restaurantId claim'i ile log okunacak restoran eslestirilir.
        var claimValue = User.FindFirstValue("restaurantId");
        return Guid.TryParse(claimValue, out var claimedRestaurantId) && claimedRestaurantId == restaurantId;
    }
}
