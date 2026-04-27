using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/admin")]
// AdminController, kategori, urun ve masa CRUD endpoint'lerini tek admin alani altinda toplar.
public class AdminController(IAdminService adminService) : ControllerBase
{
    [HttpGet("categories/{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<AdminCategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCategories(Guid restaurantId, CancellationToken cancellationToken)
    {
        var response = await adminService.GetCategoriesAsync(restaurantId, cancellationToken);
        return response is null
            ? NotFound(new { message = "Restaurant was not found or is inactive." })
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
            return BadRequest(new { message = "Restaurant id and category name are required." });
        }

        var response = await adminService.CreateCategoryAsync(request, cancellationToken);
        return response is null
            ? NotFound(new { message = "Restaurant was not found or is inactive." })
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
            return BadRequest(new { message = "Restaurant id and category name are required." });
        }

        var response = await adminService.UpdateCategoryAsync(id, request, cancellationToken);
        return response is null
            ? NotFound(new { message = "Category was not found for this restaurant." })
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
                ? NotFound(new { message = "Category was not found." })
                : NoContent();
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpGet("products/{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<AdminProductDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProducts(Guid restaurantId, CancellationToken cancellationToken)
    {
        var response = await adminService.GetProductsAsync(restaurantId, cancellationToken);
        return response is null
            ? NotFound(new { message = "Restaurant was not found or is inactive." })
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
            return BadRequest(new { message = "Restaurant id, category id and product name are required." });
        }

        try
        {
            var response = await adminService.CreateProductAsync(request, cancellationToken);
            return response is null
                ? NotFound(new { message = "Restaurant was not found or is inactive." })
                : Created($"/api/admin/products/{response.ProductId}", response);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
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
            return BadRequest(new { message = "Restaurant id, category id and product name are required." });
        }

        try
        {
            var response = await adminService.UpdateProductAsync(id, request, cancellationToken);
            return response is null
                ? NotFound(new { message = "Product was not found for this restaurant." })
                : Ok(response);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
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
                ? NotFound(new { message = "Product was not found." })
                : NoContent();
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpGet("tables/{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<AdminTableDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTables(Guid restaurantId, CancellationToken cancellationToken)
    {
        var response = await adminService.GetTablesAsync(restaurantId, cancellationToken);
        return response is null
            ? NotFound(new { message = "Restaurant was not found or is inactive." })
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
            return BadRequest(new { message = "Restaurant id and table name are required." });
        }

        var response = await adminService.CreateTableAsync(request, cancellationToken);
        return response is null
            ? NotFound(new { message = "Restaurant was not found or is inactive." })
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
            return BadRequest(new { message = "Restaurant id and table name are required." });
        }

        var response = await adminService.UpdateTableAsync(id, request, cancellationToken);
        return response is null
            ? NotFound(new { message = "Table was not found for this restaurant." })
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
                ? NotFound(new { message = "Table was not found." })
                : NoContent();
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }
}
