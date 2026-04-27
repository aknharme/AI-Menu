using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/recommendation")]
// RecommendationController, AI'nin tag uretimi ile backend urun filtrelemesini baglayan HTTP katmanidir.
public class RecommendationController(IRecommendationService recommendationService) : ControllerBase
{
    [HttpPost("products")]
    [ProducesResponseType(typeof(RecommendationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRecommendedProducts(
        [FromBody] RecommendationProductsRequestDto request,
        CancellationToken cancellationToken)
    {
        if (request.RestaurantId == Guid.Empty)
        {
            return BadRequest(new { message = "Restaurant id is required." });
        }

        var response = await recommendationService.GetProductsByTagsAsync(request, cancellationToken);
        if (response is null)
        {
            return NotFound(new { message = "Restaurant was not found or is inactive." });
        }

        return Ok(response);
    }

    [HttpPost("tags")]
    [HttpPost]
    [ProducesResponseType(typeof(AiTagResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GenerateTags(
        [FromBody] RecommendationPromptRequestDto request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            return BadRequest(new { message = "Prompt is required." });
        }

        return Ok(await recommendationService.GenerateTagsAsync(request, cancellationToken));
    }

    [HttpPost("prompt")]
    [ProducesResponseType(typeof(RecommendationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRecommendedProductsByPrompt(
        [FromBody] RecommendationPromptRequestDto request,
        CancellationToken cancellationToken)
    {
        if (request.RestaurantId == Guid.Empty || string.IsNullOrWhiteSpace(request.Prompt))
        {
            return BadRequest(new { message = "Restaurant id and prompt are required." });
        }

        var response = await recommendationService.GetProductsByPromptAsync(request, cancellationToken);
        if (response is null)
        {
            return NotFound(new { message = "Restaurant was not found or is inactive." });
        }

        return Ok(response);
    }
}
