using System.Security.Claims;
using AiMenu.Api.Constants;
using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/admin")]
// AdminStatsController, dashboard ve analiz endpoint'lerini tek admin alani altinda toplar.
[Authorize(Roles = AppRoles.Admin)]
public class AdminStatsController(IAdminStatsService adminStatsService) : ControllerBase
{
    [HttpGet("dashboard/{restaurantId:guid}")]
    [ProducesResponseType(typeof(DashboardSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDashboard(
        Guid restaurantId,
        [FromQuery] DateOnly? date,
        CancellationToken cancellationToken)
    {
        if (!IsRestaurantAccessAllowed(restaurantId))
        {
            return Forbid();
        }

        var summary = await adminStatsService.GetDashboardSummaryAsync(restaurantId, date, cancellationToken);
        return summary is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Ok(summary);
    }

    [HttpGet("stats/top-products/{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<TopProductDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTopProducts(
        Guid restaurantId,
        [FromQuery] DateOnly? date,
        CancellationToken cancellationToken)
    {
        if (!IsRestaurantAccessAllowed(restaurantId))
        {
            return Forbid();
        }

        var stats = await adminStatsService.GetTopProductsAsync(restaurantId, date, cancellationToken);
        return stats is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Ok(stats);
    }

    [HttpGet("stats/recommendations/{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<RecommendationStatDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRecommendations(
        Guid restaurantId,
        [FromQuery] DateOnly? date,
        CancellationToken cancellationToken)
    {
        if (!IsRestaurantAccessAllowed(restaurantId))
        {
            return Forbid();
        }

        var stats = await adminStatsService.GetRecommendationStatsAsync(restaurantId, date, cancellationToken);
        return stats is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Ok(stats);
    }

    [HttpGet("stats/recent-orders/{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<RecentOrderDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRecentOrders(
        Guid restaurantId,
        [FromQuery] DateOnly? date,
        CancellationToken cancellationToken)
    {
        if (!IsRestaurantAccessAllowed(restaurantId))
        {
            return Forbid();
        }

        var stats = await adminStatsService.GetRecentOrdersAsync(restaurantId, date, cancellationToken);
        return stats is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Ok(stats);
    }

    private bool IsRestaurantAccessAllowed(Guid restaurantId)
    {
        // Dashboard istatistikleri de token icindeki restaurantId claim'i ile sinirlanir.
        var claimValue = User.FindFirstValue("restaurantId");
        return Guid.TryParse(claimValue, out var claimedRestaurantId) && claimedRestaurantId == restaurantId;
    }
}
