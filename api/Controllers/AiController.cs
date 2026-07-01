using AiMenu.Api.Constants;
using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/ai")]
public class AiController(IAiService aiService) : ControllerBase
{
    /// <summary>
    /// Müşterinin web arayüzünden gönderdiği mesaja karşılık, 
    /// veritabanı ürün listesini de katarak local AI modelinden (Ollama) cevap döner.
    /// </summary>
    [HttpPost("{restaurantId:guid}/chat")]
    [ProducesResponseType(typeof(AiChatResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Chat(
        Guid restaurantId, 
        [FromBody] AiChatRequestDto request, 
        CancellationToken cancellationToken)
    {
        if (restaurantId == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id is required.", ApiErrorCodes.BadRequest));
        }

        if (request == null || string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(ApiErrorResponseDto.Create("Message content cannot be empty.", ApiErrorCodes.BadRequest));
        }

        var result = await aiService.ChatAsync(restaurantId, request, cancellationToken);
        if (result == null)
        {
            return NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound));
        }

        return Ok(result);
    }
}
