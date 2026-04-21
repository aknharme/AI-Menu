using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/admin/categories")]
public class AdminCategoriesController(IAdminCatalogService adminCatalogService) : ControllerBase
{
    [HttpGet("{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<AdminCategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCategories(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (restaurantId == Guid.Empty)
        {
            return BadRequest(new ApiErrorResponseDto { Message = "Restaurant id is required." });
        }

        var categories = await adminCatalogService.GetCategoriesAsync(restaurantId, cancellationToken);
        if (categories is null)
        {
            return NotFound(new ApiErrorResponseDto { Message = "Restaurant was not found or is inactive." });
        }

        return Ok(categories);
    }

    [HttpPost]
    [ProducesResponseType(typeof(AdminCategoryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCategory([FromBody] CreateAdminCategoryRequestDto request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await adminCatalogService.CreateCategoryAsync(request, cancellationToken);
            return Created($"/api/admin/categories/{created.CategoryId}", created);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new ApiErrorResponseDto { Message = exception.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AdminCategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateAdminCategoryRequestDto request, CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return BadRequest(new ApiErrorResponseDto { Message = "Category id is required." });
        }

        try
        {
            var updated = await adminCatalogService.UpdateCategoryAsync(id, request, cancellationToken);
            if (updated is null)
            {
                return NotFound(new ApiErrorResponseDto { Message = "Category was not found in this restaurant." });
            }

            return Ok(updated);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new ApiErrorResponseDto { Message = exception.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return BadRequest(new ApiErrorResponseDto { Message = "Category id is required." });
        }

        try
        {
            var deleted = await adminCatalogService.DeleteCategoryAsync(id, cancellationToken);
            if (!deleted)
            {
                return NotFound(new ApiErrorResponseDto { Message = "Category was not found." });
            }

            return NoContent();
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new ApiErrorResponseDto { Message = exception.Message });
        }
    }
}
