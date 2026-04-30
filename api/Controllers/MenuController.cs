using AiMenu.Api.Constants;
using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/menu")]
// MenuController sadece HTTP katmanidir; veri ve is kurali detayini service'e birakir.
public class MenuController(IMenuService menuService) : ControllerBase
{
    // Restoranın müşteri menüsünü kategori bazlı tek response olarak döndürür.
    [HttpGet("{restaurantId:guid}")]
    [ProducesResponseType(typeof(MenuResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMenu(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (restaurantId == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id is required.", ApiErrorCodes.BadRequest));
        }

        var menu = await menuService.GetMenuAsync(restaurantId, cancellationToken);
        if (menu is null)
        {
            return NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound));
        }

        return Ok(menu);
    }

    // Kategori ekranı veya sekme yapısı için aktif kategorileri ürünleriyle döndürür.
    [HttpGet("{restaurantId:guid}/categories")]
    [ProducesResponseType(typeof(IReadOnlyCollection<CategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCategories(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (restaurantId == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id is required.", ApiErrorCodes.BadRequest));
        }

        var categories = await menuService.GetCategoriesAsync(restaurantId, cancellationToken);
        if (categories is null)
        {
            return NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound));
        }

        return Ok(categories);
    }

    // Arama/liste ekranları için restorana ait aktif ürünleri düz liste olarak döndürür.
    [HttpGet("{restaurantId:guid}/products")]
    [ProducesResponseType(typeof(IReadOnlyCollection<ProductListDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProducts(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (restaurantId == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id is required.", ApiErrorCodes.BadRequest));
        }

        var products = await menuService.GetProductsAsync(restaurantId, cancellationToken);
        if (products is null)
        {
            return NotFound(ApiErrorResponseDto.Create("Restaurant was not found or is inactive.", ApiErrorCodes.NotFound));
        }

        return Ok(products);
    }

    // Ürün detay sayfası için içerik, alerjen, tag ve varyant bilgilerini döndürür.
    [HttpGet("{restaurantId:guid}/products/{productId:guid}")]
    [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProduct(Guid restaurantId, Guid productId, CancellationToken cancellationToken)
    {
        if (restaurantId == Guid.Empty || productId == Guid.Empty)
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id and product id are required.", ApiErrorCodes.BadRequest));
        }

        var product = await menuService.GetProductAsync(restaurantId, productId, cancellationToken);
        if (product is null)
        {
            return NotFound(ApiErrorResponseDto.Create("Product was not found in this restaurant menu or is inactive.", ApiErrorCodes.NotFound));
        }

        return Ok(product);
    }
}
