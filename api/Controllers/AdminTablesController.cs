using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/admin/tables")]
public class AdminTablesController(IAdminCatalogService adminCatalogService) : ControllerBase
{
    [HttpGet("{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<AdminTableDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTables(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (restaurantId == Guid.Empty)
        {
            return BadRequest(new ApiErrorResponseDto { Message = "Restaurant id is required." });
        }

        var tables = await adminCatalogService.GetTablesAsync(restaurantId, cancellationToken);
        if (tables is null)
        {
            return NotFound(new ApiErrorResponseDto { Message = "Restaurant was not found or is inactive." });
        }

        return Ok(tables);
    }

    [HttpPost]
    [ProducesResponseType(typeof(AdminTableDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTable([FromBody] CreateAdminTableRequestDto request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await adminCatalogService.CreateTableAsync(request, cancellationToken);
            return Created($"/api/admin/tables/{created.TableId}", created);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new ApiErrorResponseDto { Message = exception.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AdminTableDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTable(Guid id, [FromBody] UpdateAdminTableRequestDto request, CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return BadRequest(new ApiErrorResponseDto { Message = "Table id is required." });
        }

        try
        {
            var updated = await adminCatalogService.UpdateTableAsync(id, request, cancellationToken);
            if (updated is null)
            {
                return NotFound(new ApiErrorResponseDto { Message = "Table was not found in this restaurant." });
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
    public async Task<IActionResult> DeleteTable(Guid id, CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return BadRequest(new ApiErrorResponseDto { Message = "Table id is required." });
        }

        try
        {
            var deleted = await adminCatalogService.DeleteTableAsync(id, cancellationToken);
            if (!deleted)
            {
                return NotFound(new ApiErrorResponseDto { Message = "Table was not found." });
            }

            return NoContent();
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new ApiErrorResponseDto { Message = exception.Message });
        }
    }
}
