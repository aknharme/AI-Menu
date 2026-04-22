using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services.Interfaces;

namespace AiMenu.Api.Services;

public class AdminCatalogService(
    IAdminCatalogRepository adminCatalogRepository,
    IRestaurantRepository restaurantRepository,
    IConfiguration configuration) : IAdminCatalogService
{
    public async Task<IReadOnlyCollection<AdminCategoryDto>?> GetCategoriesAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        if (await restaurantRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var categories = await adminCatalogRepository.GetCategoriesAsync(restaurantId, cancellationToken);
        return categories.Select(MapCategory).ToList();
    }

    public async Task<AdminCategoryDto> CreateCategoryAsync(CreateAdminCategoryRequestDto request, CancellationToken cancellationToken = default)
    {
        await EnsureRestaurantExists(request.RestaurantId, cancellationToken);

        var category = new Category
        {
            CategoryId = Guid.NewGuid(),
            RestaurantId = request.RestaurantId,
            Name = request.Name.Trim(),
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive
        };

        var created = await adminCatalogRepository.AddCategoryAsync(category, cancellationToken);
        return MapCategory(created);
    }

    public async Task<AdminCategoryDto?> UpdateCategoryAsync(Guid categoryId, UpdateAdminCategoryRequestDto request, CancellationToken cancellationToken = default)
    {
        await EnsureRestaurantExists(request.RestaurantId, cancellationToken);

        var category = await adminCatalogRepository.GetCategoryByRestaurantAsync(request.RestaurantId, categoryId, cancellationToken);
        if (category is null)
        {
            return null;
        }

        category.Name = request.Name.Trim();
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;

        var updated = await adminCatalogRepository.UpdateCategoryAsync(category, cancellationToken);
        return MapCategory(updated);
    }

    public async Task<bool> DeleteCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        var category = await adminCatalogRepository.GetCategoryAsync(categoryId, cancellationToken);
        if (category is null)
        {
            return false;
        }

        if (await adminCatalogRepository.CategoryHasProductsAsync(categoryId, cancellationToken))
        {
            throw new InvalidOperationException("Category cannot be deleted while products are assigned to it.");
        }

        await adminCatalogRepository.DeleteCategoryAsync(category, cancellationToken);
        return true;
    }

    public async Task<IReadOnlyCollection<AdminProductDto>?> GetProductsAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        if (await restaurantRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var products = await adminCatalogRepository.GetProductsAsync(restaurantId, cancellationToken);
        return products.Select(MapProduct).ToList();
    }

    public async Task<AdminProductDto> CreateProductAsync(CreateAdminProductRequestDto request, CancellationToken cancellationToken = default)
    {
        await EnsureRestaurantExists(request.RestaurantId, cancellationToken);

        var category = await adminCatalogRepository.GetCategoryByRestaurantAsync(request.RestaurantId, request.CategoryId, cancellationToken);
        if (category is null)
        {
            throw new InvalidOperationException("Category was not found in this restaurant.");
        }

        var product = new Product
        {
            ProductId = Guid.NewGuid(),
            RestaurantId = request.RestaurantId,
            CategoryId = request.CategoryId,
            Name = request.Name.Trim(),
            Price = request.Price,
            Description = request.Description.Trim(),
            Ingredients = request.Content.Trim(),
            IsActive = request.IsActive
        };

        var created = await adminCatalogRepository.AddProductAsync(product, cancellationToken);
        return MapProduct(created);
    }

    public async Task<AdminProductDto?> UpdateProductAsync(Guid productId, UpdateAdminProductRequestDto request, CancellationToken cancellationToken = default)
    {
        await EnsureRestaurantExists(request.RestaurantId, cancellationToken);

        var category = await adminCatalogRepository.GetCategoryByRestaurantAsync(request.RestaurantId, request.CategoryId, cancellationToken);
        if (category is null)
        {
            throw new InvalidOperationException("Category was not found in this restaurant.");
        }

        var product = await adminCatalogRepository.GetProductByRestaurantAsync(request.RestaurantId, productId, cancellationToken);
        if (product is null)
        {
            return null;
        }

        product.CategoryId = request.CategoryId;
        product.Name = request.Name.Trim();
        product.Price = request.Price;
        product.Description = request.Description.Trim();
        product.Ingredients = request.Content.Trim();
        product.IsActive = request.IsActive;

        var updated = await adminCatalogRepository.UpdateProductAsync(product, cancellationToken);
        return MapProduct(updated);
    }

    public async Task<bool> DeleteProductAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        var product = await adminCatalogRepository.GetProductAsync(productId, cancellationToken);
        if (product is null)
        {
            return false;
        }

        await adminCatalogRepository.DeleteProductAsync(product, cancellationToken);
        return true;
    }

    public async Task<IReadOnlyCollection<AdminTableDto>?> GetTablesAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        if (await restaurantRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var tables = await adminCatalogRepository.GetTablesAsync(restaurantId, cancellationToken);
        return tables.Select(MapTable).ToList();
    }

    public async Task<AdminTableDto> CreateTableAsync(CreateAdminTableRequestDto request, CancellationToken cancellationToken = default)
    {
        await EnsureRestaurantExists(request.RestaurantId, cancellationToken);
        EnsureTableNameIsValid(request.Name);

        var tableId = Guid.NewGuid();
        var table = new Table
        {
            TableId = tableId,
            RestaurantId = request.RestaurantId,
            Name = request.Name.Trim(),
            QrCodeValue = BuildMenuUrl(request.RestaurantId, tableId),
            IsActive = request.IsActive
        };

        var created = await adminCatalogRepository.AddTableAsync(table, cancellationToken);
        return MapTable(created);
    }

    public async Task<AdminTableDto?> UpdateTableAsync(Guid tableId, UpdateAdminTableRequestDto request, CancellationToken cancellationToken = default)
    {
        await EnsureRestaurantExists(request.RestaurantId, cancellationToken);
        EnsureTableNameIsValid(request.Name);

        var table = await adminCatalogRepository.GetTableByRestaurantAsync(request.RestaurantId, tableId, cancellationToken);
        if (table is null)
        {
            return null;
        }

        table.Name = request.Name.Trim();
        table.IsActive = request.IsActive;
        table.QrCodeValue = BuildMenuUrl(request.RestaurantId, table.TableId);

        var updated = await adminCatalogRepository.UpdateTableAsync(table, cancellationToken);
        return MapTable(updated);
    }

    public async Task<bool> DeleteTableAsync(Guid tableId, CancellationToken cancellationToken = default)
    {
        var table = await adminCatalogRepository.GetTableAsync(tableId, cancellationToken);
        if (table is null)
        {
            return false;
        }

        if (await adminCatalogRepository.TableHasOrdersAsync(tableId, cancellationToken))
        {
            throw new InvalidOperationException("Table cannot be deleted while it has orders.");
        }

        await adminCatalogRepository.DeleteTableAsync(table, cancellationToken);
        return true;
    }

    private async Task EnsureRestaurantExists(Guid restaurantId, CancellationToken cancellationToken)
    {
        if (restaurantId == Guid.Empty)
        {
            throw new InvalidOperationException("Restaurant id is required.");
        }

        if (await restaurantRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            throw new InvalidOperationException("Restaurant was not found or is inactive.");
        }
    }

    private static void EnsureTableNameIsValid(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new InvalidOperationException("Table name is required.");
        }
    }

    private string BuildMenuUrl(Guid restaurantId, Guid tableId)
    {
        var configuredBaseUrl = configuration["PublicUrls:CustomerMenuBaseUrl"]
            ?? Environment.GetEnvironmentVariable("PUBLIC_CUSTOMER_MENU_BASE_URL")
            ?? "http://127.0.0.1:5173/menu";

        var trimmedBaseUrl = configuredBaseUrl.TrimEnd('/');
        return $"{trimmedBaseUrl}?restaurantId={restaurantId}&tableId={tableId}";
    }

    private static AdminCategoryDto MapCategory(Category category)
    {
        return new AdminCategoryDto
        {
            CategoryId = category.CategoryId,
            RestaurantId = category.RestaurantId,
            Name = category.Name,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            ProductCount = category.Products.Count
        };
    }

    private static AdminProductDto MapProduct(Product product)
    {
        return new AdminProductDto
        {
            ProductId = product.ProductId,
            RestaurantId = product.RestaurantId,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? string.Empty,
            Name = product.Name,
            Price = product.Price,
            Description = product.Description,
            Content = product.Ingredients,
            IsActive = product.IsActive
        };
    }

    private static AdminTableDto MapTable(Table table)
    {
        return new AdminTableDto
        {
            TableId = table.TableId,
            RestaurantId = table.RestaurantId,
            Name = table.Name,
            MenuUrl = table.QrCodeValue,
            QrCodeValue = table.QrCodeValue,
            IsActive = table.IsActive
        };
    }
}
