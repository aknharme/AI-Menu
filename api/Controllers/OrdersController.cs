using AiMenu.Api.Constants;
using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/orders")]
// OrdersController siparis olusturma endpoint'ini expose eder.
public class OrdersController(IOrderService orderService) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOrder(
        [FromBody] CreateOrderRequestDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var createdOrder = await orderService.CreateOrderAsync(request, cancellationToken);
            return Created($"/api/orders/{createdOrder.OrderId}", createdOrder);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(ApiErrorResponseDto.Create(exception.Message, ApiErrorCodes.BadRequest));
        }
    }

    [HttpGet("{orderId:guid}")]
    [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrder(Guid orderId, CancellationToken cancellationToken)
    {
        if (orderId == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Order id is required.", ApiErrorCodes.BadRequest));
        }

        var order = await orderService.GetOrderAsync(orderId, cancellationToken);
        if (order is null)
        {
            return NotFound(ApiErrorResponseDto.Create("Order was not found.", ApiErrorCodes.NotFound));
        }

        return Ok(order);
    }
}
