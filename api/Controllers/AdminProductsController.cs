using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/admin/products")]
public class AdminProductsController(IAdminCatalogService adminCatalogService) : ControllerBase
{
    [HttpGet("{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<AdminProductDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProducts(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (restaurantId == Guid.Empty)
        {
            return BadRequest(new ApiErrorResponseDto { Message = "Restaurant id is required." });
        }

        var products = await adminCatalogService.GetProductsAsync(restaurantId, cancellationToken);
        if (products is null)
        {
            return NotFound(new ApiErrorResponseDto { Message = "Restaurant was not found or is inactive." });
        }

        return Ok(products);
    }

    [HttpPost]
    [ProducesResponseType(typeof(AdminProductDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProduct([FromBody] CreateAdminProductRequestDto request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await adminCatalogService.CreateProductAsync(request, cancellationToken);
            return Created($"/api/admin/products/{created.ProductId}", created);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new ApiErrorResponseDto { Message = exception.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AdminProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateAdminProductRequestDto request, CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return BadRequest(new ApiErrorResponseDto { Message = "Product id is required." });
        }

        try
        {
            var updated = await adminCatalogService.UpdateProductAsync(id, request, cancellationToken);
            if (updated is null)
            {
                return NotFound(new ApiErrorResponseDto { Message = "Product was not found in this restaurant." });
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
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return BadRequest(new ApiErrorResponseDto { Message = "Product id is required." });
        }

        var deleted = await adminCatalogService.DeleteProductAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound(new ApiErrorResponseDto { Message = "Product was not found." });
        }

        return NoContent();
    }
}
