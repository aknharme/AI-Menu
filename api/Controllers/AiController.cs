using AiMenu.Api.Constants;
using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/ai")]
public class AiController(IAiMessageService aiMessageService) : ControllerBase
{
    [HttpPost("message")]
    [ProducesResponseType(typeof(AiMessageResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SendMessage([FromBody] AiMessageRequestDto request, CancellationToken cancellationToken)
    {
        if (request.RestaurantId == Guid.Empty || string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id and message are required.", ApiErrorCodes.BadRequest));
        }

        var response = await aiMessageService.HandleAsync(request, cancellationToken);
        if (response is null)
        {
            return NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound));
        }

        return Ok(response);
    }
}
