using System.Security.Claims;
using AiMenu.Api.Constants;
using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/cashier/orders")]
[Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Cashier}")]
public class CashierOrdersController(ICashierService cashierService) : ControllerBase
{
    [HttpGet("{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<CashierOrderListDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrders(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (restaurantId == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id is required.", ApiErrorCodes.BadRequest));
        }

        if (!IsRestaurantAccessAllowed(restaurantId))
        {
            return Forbid();
        }

        var orders = await cashierService.GetOrdersAsync(restaurantId, cancellationToken);
        if (orders is null)
        {
            return NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound));
        }

        return Ok(orders);
    }

    [HttpGet("{restaurantId:guid}/{orderId:guid}")]
    [ProducesResponseType(typeof(CashierOrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrder(Guid restaurantId, Guid orderId, CancellationToken cancellationToken)
    {
        if (restaurantId == Guid.Empty || orderId == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id and order id are required.", ApiErrorCodes.BadRequest));
        }

        if (!IsRestaurantAccessAllowed(restaurantId))
        {
            return Forbid();
        }

        var order = await cashierService.GetOrderAsync(restaurantId, orderId, cancellationToken);
        if (order is null)
        {
            return NotFound(ApiErrorResponseDto.Create("Order was not found in this restaurant.", ApiErrorCodes.NotFound));
        }

        return Ok(order);
    }

    [HttpPut("{restaurantId:guid}/{orderId:guid}/status")]
    [ProducesResponseType(typeof(CashierOrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOrderStatus(
        Guid restaurantId,
        Guid orderId,
        [FromBody] UpdateOrderStatusRequestDto request,
        CancellationToken cancellationToken)
    {
        if (restaurantId == Guid.Empty || orderId == Guid.Empty || string.IsNullOrWhiteSpace(request.Status))
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id, order id and status are required.", ApiErrorCodes.BadRequest));
        }

        if (!IsRestaurantAccessAllowed(restaurantId))
        {
            return Forbid();
        }

        try
        {
            var order = await cashierService.UpdateOrderStatusAsync(restaurantId, orderId, request.Status, cancellationToken);
            return order is null
                ? NotFound(ApiErrorResponseDto.Create("Order was not found in this restaurant.", ApiErrorCodes.NotFound))
                : Ok(order);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(ApiErrorResponseDto.Create(exception.Message, ApiErrorCodes.BadRequest));
        }
    }

    private bool IsRestaurantAccessAllowed(Guid restaurantId)
    {
        // Cashier ve admin token'lari sadece kendi restoran verisini gorebilir.
        var claimValue = User.FindFirstValue("restaurantId");
        return Guid.TryParse(claimValue, out var claimedRestaurantId) && claimedRestaurantId == restaurantId;
    }
}
