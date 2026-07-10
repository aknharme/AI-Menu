using System.Security.Claims;
using AiMenu.Api.Constants;
using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/admin/catalog/products")]
[Authorize(Roles = AppRoles.Admin)]
public class AdminProductsController(IAdminService adminService) : ControllerBase
{
    [HttpGet("{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<AdminProductDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProducts(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (restaurantId == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id is required.", ApiErrorCodes.BadRequest));
        }

        if (!IsRestaurantAccessAllowed(restaurantId))
        {
            return Forbid();
        }

        var products = await adminService.GetProductsAsync(restaurantId, cancellationToken);
        return products is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Ok(products);
    }

    [HttpPost]
    [ProducesResponseType(typeof(AdminProductDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateProduct([FromBody] SaveAdminProductRequestDto request, CancellationToken cancellationToken)
    {
        if (request.RestaurantId == Guid.Empty || request.CategoryId == Guid.Empty || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id, category id and product name are required.", ApiErrorCodes.BadRequest));
        }

        if (!IsRestaurantAccessAllowed(request.RestaurantId))
        {
            return Forbid();
        }

        try
        {
            var created = await adminService.CreateProductAsync(request, cancellationToken);
            return created is null
                ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
                : Created($"/api/admin/catalog/products/{created.ProductId}", created);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(ApiErrorResponseDto.Create(exception.Message, ApiErrorCodes.BadRequest));
        }
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AdminProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] SaveAdminProductRequestDto request, CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Product id is required.", ApiErrorCodes.BadRequest));
        }

        if (request.RestaurantId == Guid.Empty || request.CategoryId == Guid.Empty || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id, category id and product name are required.", ApiErrorCodes.BadRequest));
        }

        if (!IsRestaurantAccessAllowed(request.RestaurantId))
        {
            return Forbid();
        }

        try
        {
            var updated = await adminService.UpdateProductAsync(id, request, cancellationToken);
            return updated is null
                ? NotFound(ApiErrorResponseDto.Create("Product was not found for this restaurant.", ApiErrorCodes.NotFound))
                : Ok(updated);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(ApiErrorResponseDto.Create(exception.Message, ApiErrorCodes.BadRequest));
        }
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Product id is required.", ApiErrorCodes.BadRequest));
        }

        if (!TryGetClaimedRestaurantId(out var restaurantId))
        {
            return Forbid();
        }

        try
        {
            var deleted = await adminService.DeleteProductAsync(id, restaurantId, cancellationToken);
            return deleted is null
                ? NotFound(ApiErrorResponseDto.Create("Product was not found.", ApiErrorCodes.NotFound))
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
