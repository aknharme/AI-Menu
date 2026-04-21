using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/cashier/orders")]
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
            return BadRequest(new ApiErrorResponseDto { Message = "Restaurant id is required." });
        }

        var orders = await cashierService.GetOrdersAsync(restaurantId, cancellationToken);
        if (orders is null)
        {
            return NotFound(new ApiErrorResponseDto { Message = "Restaurant was not found or is inactive." });
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
            return BadRequest(new ApiErrorResponseDto { Message = "Restaurant id and order id are required." });
        }

        var order = await cashierService.GetOrderAsync(restaurantId, orderId, cancellationToken);
        if (order is null)
        {
            return NotFound(new ApiErrorResponseDto { Message = "Order was not found in this restaurant." });
        }

        return Ok(order);
    }
}
