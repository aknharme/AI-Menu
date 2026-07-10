using System.Security.Claims;
using AiMenu.Api.Constants;
using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/admin/catalog/tables")]
[Authorize(Roles = AppRoles.Admin)]
public class AdminTablesController(IAdminService adminService) : ControllerBase
{
    [HttpGet("{restaurantId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<AdminTableDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTables(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (restaurantId == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id is required.", ApiErrorCodes.BadRequest));
        }

        if (!IsRestaurantAccessAllowed(restaurantId))
        {
            return Forbid();
        }

        var tables = await adminService.GetTablesAsync(restaurantId, cancellationToken);
        return tables is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Ok(tables);
    }

    [HttpPost]
    [ProducesResponseType(typeof(AdminTableDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
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

        var created = await adminService.CreateTableAsync(request, cancellationToken);
        return created is null
            ? NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound))
            : Created($"/api/admin/catalog/tables/{created.TableId}", created);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AdminTableDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTable(Guid id, [FromBody] SaveAdminTableRequestDto request, CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Table id is required.", ApiErrorCodes.BadRequest));
        }

        if (request.RestaurantId == Guid.Empty || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id and table name are required.", ApiErrorCodes.BadRequest));
        }

        if (!IsRestaurantAccessAllowed(request.RestaurantId))
        {
            return Forbid();
        }

        var updated = await adminService.UpdateTableAsync(id, request, cancellationToken);
        return updated is null
            ? NotFound(ApiErrorResponseDto.Create("Table was not found for this restaurant.", ApiErrorCodes.NotFound))
            : Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTable(Guid id, CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Table id is required.", ApiErrorCodes.BadRequest));
        }

        if (!TryGetClaimedRestaurantId(out var restaurantId))
        {
            return Forbid();
        }

        try
        {
            var deleted = await adminService.DeleteTableAsync(id, restaurantId, cancellationToken);
            return deleted is null
                ? NotFound(ApiErrorResponseDto.Create("Table was not found.", ApiErrorCodes.NotFound))
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
