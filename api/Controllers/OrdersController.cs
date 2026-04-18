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
            return BadRequest(new { message = exception.Message });
        }
    }
}
