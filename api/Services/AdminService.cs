using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Services;

public class AdminService(IAdminRepository adminRepository) : IAdminService
{
    public async Task<IReadOnlyCollection<AdminCategoryDto>?> GetCategoriesAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        if (await adminRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var categories = await adminRepository.GetCategoriesAsync(restaurantId, cancellationToken);
        return categories.Select(MapCategory).ToList();
    }

    public async Task<AdminCategoryDto?> CreateCategoryAsync(SaveAdminCategoryRequestDto request, CancellationToken cancellationToken = default)
    {
        if (await adminRepository.GetRestaurantAsync(request.RestaurantId, cancellationToken) is null)
        {
            return null;
        }

        var category = new Category
        {
            CategoryId = Guid.NewGuid(),
            RestaurantId = request.RestaurantId,
            Name = request.Name.Trim(),
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive
        };

        await adminRepository.AddCategoryAsync(category, cancellationToken);
        await adminRepository.SaveChangesAsync(cancellationToken);

        return MapCategory(category);
    }

    public async Task<AdminCategoryDto?> UpdateCategoryAsync(Guid categoryId, SaveAdminCategoryRequestDto request, CancellationToken cancellationToken = default)
    {
        var category = await adminRepository.GetCategoryAsync(categoryId, cancellationToken);
        if (category is null || category.RestaurantId != request.RestaurantId)
        {
            return null;
        }

        category.Name = request.Name.Trim();
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;

        await adminRepository.SaveChangesAsync(cancellationToken);
        return MapCategory(category);
    }

    public async Task<bool?> DeleteCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        var category = await adminRepository.GetCategoryAsync(categoryId, cancellationToken);
        if (category is null)
        {
            return null;
        }

        if (await adminRepository.HasProductsInCategoryAsync(categoryId, cancellationToken))
        {
            throw new InvalidOperationException("Category has products. Move or delete products before removing this category.");
        }

        await adminRepository.DeleteCategoryAsync(category, cancellationToken);
        await adminRepository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyCollection<AdminProductDto>?> GetProductsAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        if (await adminRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var products = await adminRepository.GetProductsAsync(restaurantId, cancellationToken);
        return products.Select(MapProduct).ToList();
    }

    public async Task<AdminProductDto?> CreateProductAsync(SaveAdminProductRequestDto request, CancellationToken cancellationToken = default)
    {
        if (await adminRepository.GetRestaurantAsync(request.RestaurantId, cancellationToken) is null)
        {
            return null;
        }

        if (request.Price < 0)
        {
            throw new InvalidOperationException("Price must be zero or greater.");
        }

        var category = await adminRepository.GetCategoryAsync(request.CategoryId, cancellationToken);
        if (category is null || category.RestaurantId != request.RestaurantId)
        {
            throw new InvalidOperationException("Category was not found for this restaurant.");
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

        await adminRepository.AddProductAsync(product, cancellationToken);
        await adminRepository.SaveChangesAsync(cancellationToken);

        var createdProduct = await adminRepository.GetProductAsync(product.ProductId, cancellationToken);
        return createdProduct is null ? null : MapProduct(createdProduct);
    }

    public async Task<AdminProductDto?> UpdateProductAsync(Guid productId, SaveAdminProductRequestDto request, CancellationToken cancellationToken = default)
    {
        var product = await adminRepository.GetProductAsync(productId, cancellationToken);
        if (product is null || product.RestaurantId != request.RestaurantId)
        {
            return null;
        }

        if (request.Price < 0)
        {
            throw new InvalidOperationException("Price must be zero or greater.");
        }

        var category = await adminRepository.GetCategoryAsync(request.CategoryId, cancellationToken);
        if (category is null || category.RestaurantId != request.RestaurantId)
        {
            throw new InvalidOperationException("Category was not found for this restaurant.");
        }

        product.CategoryId = request.CategoryId;
        product.Name = request.Name.Trim();
        product.Price = request.Price;
        product.Description = request.Description.Trim();
        product.Ingredients = request.Content.Trim();
        product.IsActive = request.IsActive;

        await adminRepository.SaveChangesAsync(cancellationToken);
        return MapProduct(product);
    }

    public async Task<bool?> DeleteProductAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        var product = await adminRepository.GetProductAsync(productId, cancellationToken);
        if (product is null)
        {
            return null;
        }

        if (await adminRepository.HasOrdersForProductAsync(productId, cancellationToken))
        {
            throw new InvalidOperationException("Product is used in orders and cannot be deleted.");
        }

        try
        {
            await adminRepository.DeleteProductAsync(product, cancellationToken);
            await adminRepository.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateException)
        {
            throw new InvalidOperationException("Product is used in orders and cannot be deleted.");
        }
    }

    public async Task<IReadOnlyCollection<AdminTableDto>?> GetTablesAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        if (await adminRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var tables = await adminRepository.GetTablesAsync(restaurantId, cancellationToken);
        return tables.Select(MapTable).ToList();
    }

    public async Task<AdminTableDto?> CreateTableAsync(SaveAdminTableRequestDto request, CancellationToken cancellationToken = default)
    {
        if (await adminRepository.GetRestaurantAsync(request.RestaurantId, cancellationToken) is null)
        {
            return null;
        }

        var table = new Table
        {
            TableId = Guid.NewGuid(),
            RestaurantId = request.RestaurantId,
            Name = request.Name.Trim(),
            IsActive = request.IsActive
        };
        table.QrCodeValue = BuildMenuUrl(table.RestaurantId, table.TableId);

        await adminRepository.AddTableAsync(table, cancellationToken);
        await adminRepository.SaveChangesAsync(cancellationToken);

        return MapTable(table);
    }

    public async Task<AdminTableDto?> UpdateTableAsync(Guid tableId, SaveAdminTableRequestDto request, CancellationToken cancellationToken = default)
    {
        var table = await adminRepository.GetTableAsync(tableId, cancellationToken);
        if (table is null || table.RestaurantId != request.RestaurantId)
        {
            return null;
        }

        table.Name = request.Name.Trim();
        table.IsActive = request.IsActive;
        table.QrCodeValue = BuildMenuUrl(table.RestaurantId, table.TableId);

        await adminRepository.SaveChangesAsync(cancellationToken);
        return MapTable(table);
    }

    public async Task<bool?> DeleteTableAsync(Guid tableId, CancellationToken cancellationToken = default)
    {
        var table = await adminRepository.GetTableAsync(tableId, cancellationToken);
        if (table is null)
        {
            return null;
        }

        if (await adminRepository.HasOrdersForTableAsync(tableId, cancellationToken))
        {
            throw new InvalidOperationException("Table has orders and cannot be deleted.");
        }

        try
        {
            await adminRepository.DeleteTableAsync(table, cancellationToken);
            await adminRepository.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateException)
        {
            throw new InvalidOperationException("Table has orders and cannot be deleted.");
        }
    }

    private static AdminCategoryDto MapCategory(Category category)
    {
        return new AdminCategoryDto
        {
            CategoryId = category.CategoryId,
            RestaurantId = category.RestaurantId,
            Name = category.Name,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive
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
            IsActive = table.IsActive,
            MenuUrl = BuildMenuUrl(table.RestaurantId, table.TableId)
        };
    }

    private static string BuildMenuUrl(Guid restaurantId, Guid tableId)
    {
        // Masa QR'lari customer-web'in query param tabanli menu akisini hedefler.
        return $"/menu?restaurantId={restaurantId}&tableId={tableId}";
    }
}
