using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/menu")]
// MenuController sadece HTTP katmanidir; veri ve is kurali detayini service'e birakir.
public class MenuController(IMenuService menuService) : ControllerBase
{
    [HttpGet("{restaurantId:guid}")]
    public async Task<IActionResult> GetMenu(Guid restaurantId, CancellationToken cancellationToken)
    {
        var menu = await menuService.GetMenuAsync(restaurantId, cancellationToken);
        if (menu is null)
        {
            return NotFound(new { message = "Restaurant menu was not found." });
        }

        return Ok(menu);
    }
}
