using System.Security.Claims;
using AiMenu.Api.Constants;
using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/admin")]
// AdminController, kategori, urun ve masa CRUD endpoint'lerini tek admin alani altinda toplar.
[Authorize(Roles = AppRoles.Admin)]
public class AdminController(IAdminService adminService) : ControllerBase
{
    [HttpGet("categories/{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<AdminCategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCategories(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (!IsRestaurantAccessAllowed(restaurantId))
        {
            return Forbid();
        }

        var response = await adminService.GetCategoriesAsync(restaurantId, cancellationToken);
        return response is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Ok(response);
    }

    [HttpPost("categories")]
    [ProducesResponseType(typeof(AdminCategoryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
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

        var response = await adminService.CreateCategoryAsync(request, cancellationToken);
        return response is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Created($"/api/admin/categories/{response.CategoryId}", response);
    }

    [HttpPut("categories/{id:guid}")]
    [ProducesResponseType(typeof(AdminCategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] SaveAdminCategoryRequestDto request, CancellationToken cancellationToken)
    {
        if (request.RestaurantId == Guid.Empty || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id and category name are required.", ApiErrorCodes.BadRequest));
        }

        if (!IsRestaurantAccessAllowed(request.RestaurantId))
        {
            return Forbid();
        }

        var response = await adminService.UpdateCategoryAsync(id, request, cancellationToken);
        return response is null
            ? NotFound(ApiErrorResponseDto.Create("Category was not found for this restaurant.", ApiErrorCodes.NotFound))
            : Ok(response);
    }

    [HttpDelete("categories/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var response = await adminService.DeleteCategoryAsync(id, cancellationToken);
            return response is null
                ? NotFound(ApiErrorResponseDto.Create("Category was not found.", ApiErrorCodes.NotFound))
                : NoContent();
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(ApiErrorResponseDto.Create(exception.Message, ApiErrorCodes.BadRequest));
        }
    }

    [HttpGet("products/{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<AdminProductDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProducts(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (!IsRestaurantAccessAllowed(restaurantId))
        {
            return Forbid();
        }

        var response = await adminService.GetProductsAsync(restaurantId, cancellationToken);
        return response is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Ok(response);
    }

    [HttpPost("products")]
    [ProducesResponseType(typeof(AdminProductDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
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
            var response = await adminService.CreateProductAsync(request, cancellationToken);
            return response is null
                ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
                : Created($"/api/admin/products/{response.ProductId}", response);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(ApiErrorResponseDto.Create(exception.Message, ApiErrorCodes.BadRequest));
        }
    }

    [HttpPut("products/{id:guid}")]
    [ProducesResponseType(typeof(AdminProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] SaveAdminProductRequestDto request, CancellationToken cancellationToken)
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
            var response = await adminService.UpdateProductAsync(id, request, cancellationToken);
            return response is null
                ? NotFound(ApiErrorResponseDto.Create("Product was not found for this restaurant.", ApiErrorCodes.NotFound))
                : Ok(response);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(ApiErrorResponseDto.Create(exception.Message, ApiErrorCodes.BadRequest));
        }
    }

    [HttpDelete("products/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var response = await adminService.DeleteProductAsync(id, cancellationToken);
            return response is null
                ? NotFound(ApiErrorResponseDto.Create("Product was not found.", ApiErrorCodes.NotFound))
                : NoContent();
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(ApiErrorResponseDto.Create(exception.Message, ApiErrorCodes.BadRequest));
        }
    }

    [HttpGet("tables/{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<AdminTableDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTables(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (!IsRestaurantAccessAllowed(restaurantId))
        {
            return Forbid();
        }

        var response = await adminService.GetTablesAsync(restaurantId, cancellationToken);
        return response is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Ok(response);
    }

    [HttpPost("tables")]
    [ProducesResponseType(typeof(AdminTableDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateTable([FromBody] SaveAdminTableRequestDto request, CancellationToken cancellationToken)
    {
        if (request.RestaurantId == Guid.Empty || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id and table name are required.", ApiErrorCodes.BadRequest));
        }

        if (!IsRestaurantAccessAllowed(request.RestaurantId))
        {
            return Forbid();
        }

        var response = await adminService.CreateTableAsync(request, cancellationToken);
        return response is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Created($"/api/admin/tables/{response.TableId}", response);
    }

    [HttpPut("tables/{id:guid}")]
    [ProducesResponseType(typeof(AdminTableDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTable(Guid id, [FromBody] SaveAdminTableRequestDto request, CancellationToken cancellationToken)
    {
        if (request.RestaurantId == Guid.Empty || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id and table name are required.", ApiErrorCodes.BadRequest));
        }

        if (!IsRestaurantAccessAllowed(request.RestaurantId))
        {
            return Forbid();
        }

        var response = await adminService.UpdateTableAsync(id, request, cancellationToken);
        return response is null
            ? NotFound(ApiErrorResponseDto.Create("Table was not found for this restaurant.", ApiErrorCodes.NotFound))
            : Ok(response);
    }

    [HttpDelete("tables/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTable(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var response = await adminService.DeleteTableAsync(id, cancellationToken);
            return response is null
                ? NotFound(ApiErrorResponseDto.Create("Table was not found.", ApiErrorCodes.NotFound))
                : NoContent();
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(ApiErrorResponseDto.Create(exception.Message, ApiErrorCodes.BadRequest));
        }
    }

    private bool IsRestaurantAccessAllowed(Guid restaurantId)
    {
        // Token icindeki restaurantId claim'i ile istek restorani eslestirilir.
        var claimValue = User.FindFirstValue("restaurantId");
        return Guid.TryParse(claimValue, out var claimedRestaurantId) && claimedRestaurantId == restaurantId;
    }
}
