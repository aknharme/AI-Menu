using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/recommendation")]
// RecommendationController yalnizca kullanici metnini alip AI tag extraction servisine iletir.
public class RecommendationController(IRecommendationService recommendationService) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(RecommendationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Post(
        [FromBody] RecommendationRequestDto request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            return BadRequest(new { message = "Prompt is required." });
        }

        var response = await recommendationService.ExtractTagsAsync(request, cancellationToken);
        return Ok(response);
    }
}
