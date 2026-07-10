using System.Security.Claims;
using AiMenu.Api.Constants;
using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/admin/catalog/categories")]
[Authorize(Roles = AppRoles.Admin)]
public class AdminCategoriesController(IAdminService adminService) : ControllerBase
{
    [HttpGet("{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<AdminCategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCategories(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (restaurantId == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id is required.", ApiErrorCodes.BadRequest));
        }

        if (!IsRestaurantAccessAllowed(restaurantId))
        {
            return Forbid();
        }

        var categories = await adminService.GetCategoriesAsync(restaurantId, cancellationToken);
        return categories is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Ok(categories);
    }

    [HttpPost]
    [ProducesResponseType(typeof(AdminCategoryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateCategory([FromBody] SaveAdminCategoryRequestDto request, CancellationToken cancellationToken)
    {
        if (request.RestaurantId == Guid.Empty || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id and category name are required.", ApiErrorCodes.BadRequest));
        }

        if (!IsRestaurantAccessAllowed(request.RestaurantId))
        {
            return Forbid();
        }

        var created = await adminService.CreateCategoryAsync(request, cancellationToken);
        return created is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Created($"/api/admin/catalog/categories/{created.CategoryId}", created);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AdminCategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] SaveAdminCategoryRequestDto request, CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Category id is required.", ApiErrorCodes.BadRequest));
        }

        if (request.RestaurantId == Guid.Empty || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id and category name are required.", ApiErrorCodes.BadRequest));
        }

        if (!IsRestaurantAccessAllowed(request.RestaurantId))
        {
            return Forbid();
        }

        var updated = await adminService.UpdateCategoryAsync(id, request, cancellationToken);
        return updated is null
            ? NotFound(ApiErrorResponseDto.Create("Category was not found for this restaurant.", ApiErrorCodes.NotFound))
            : Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Category id is required.", ApiErrorCodes.BadRequest));
        }

        if (!TryGetClaimedRestaurantId(out var restaurantId))
        {
            return Forbid();
        }

        try
        {
            var deleted = await adminService.DeleteCategoryAsync(id, restaurantId, cancellationToken);
            return deleted is null
                ? NotFound(ApiErrorResponseDto.Create("Category was not found.", ApiErrorCodes.NotFound))
                : NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(ApiErrorResponseDto.Create(exception.Message, ApiErrorCodes.BadRequest));
        }
    }

    private bool IsRestaurantAccessAllowed(Guid restaurantId)
    {
        return TryGetClaimedRestaurantId(out var claimedRestaurantId) && claimedRestaurantId == restaurantId;
    }

    private bool TryGetClaimedRestaurantId(out Guid restaurantId)
    {
        var claimValue = User.FindFirstValue("restaurantId");
        return Guid.TryParse(claimValue, out restaurantId);
    }
}
