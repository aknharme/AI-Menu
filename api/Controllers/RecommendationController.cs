using AiMenu.Api.Constants;
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
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id is required.", ApiErrorCodes.BadRequest));
        }

        var response = await recommendationService.GetProductsByTagsAsync(request, cancellationToken);
        if (response is null)
        {
            return NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound));
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
            return BadRequest(ApiErrorResponseDto.Create("Prompt is required.", ApiErrorCodes.BadRequest));
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
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id and prompt are required.", ApiErrorCodes.BadRequest));
        }

        var response = await recommendationService.GetProductsByPromptAsync(request, cancellationToken);
        if (response is null)
        {
            return NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound));
        }

        return Ok(response);
    }
}
