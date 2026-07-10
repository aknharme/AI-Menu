using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Services;

public class AdminService(IAdminRepository adminRepository, ILogService logService) : IAdminService
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
        await logService.LogAuditAsync(
            category.RestaurantId,
            "CategoryCreated",
            "Category",
            category.CategoryId,
            $"Kategori eklendi: {category.Name}",
            cancellationToken);

        return MapCategory(category);
    }

    public async Task<AdminCategoryDto?> UpdateCategoryAsync(Guid categoryId, SaveAdminCategoryRequestDto request, CancellationToken cancellationToken = default)
    {
        var category = await adminRepository.GetCategoryAsync(categoryId, cancellationToken);
        if (category is null || category.RestaurantId != request.RestaurantId)
        {
            return null;
        }

        var previousIsActive = category.IsActive;
        category.Name = request.Name.Trim();
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;

        await adminRepository.SaveChangesAsync(cancellationToken);
        await logService.LogAuditAsync(
            category.RestaurantId,
            "CategoryUpdated",
            "Category",
            category.CategoryId,
            $"Kategori guncellendi: {category.Name}",
            cancellationToken);

        if (previousIsActive != category.IsActive)
        {
            await logService.LogAuditAsync(
                category.RestaurantId,
                "CategoryStatusChanged",
                "Category",
                category.CategoryId,
                $"Kategori durumu {(category.IsActive ? "aktif" : "pasif")} yapildi: {category.Name}",
                cancellationToken);
        }

        return MapCategory(category);
    }

    public async Task<bool?> DeleteCategoryAsync(Guid categoryId, Guid restaurantId, CancellationToken cancellationToken = default)
    {
        var category = await adminRepository.GetCategoryAsync(categoryId, cancellationToken);
        if (category is null)
        {
            return null;
        }

        if (category.RestaurantId != restaurantId)
        {
            throw new UnauthorizedAccessException("Category does not belong to this restaurant.");
        }

        if (await adminRepository.HasProductsInCategoryAsync(categoryId, cancellationToken))
        {
            throw new InvalidOperationException("Category has products. Move or delete products before removing this category.");
        }

        var categoryName = category.Name;
        await adminRepository.DeleteCategoryAsync(category, cancellationToken);
        await adminRepository.SaveChangesAsync(cancellationToken);
        await logService.LogAuditAsync(
            restaurantId,
            "CategoryDeleted",
            "Category",
            categoryId,
            $"Kategori silindi: {categoryName}",
            cancellationToken);
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
        await SyncProductTagsAsync(product, request.Tags, cancellationToken);
        await SyncProductVariantsAsync(product, request.Variants, cancellationToken);
        await adminRepository.SaveChangesAsync(cancellationToken);
        await logService.LogAuditAsync(
            product.RestaurantId,
            "ProductCreated",
            "Product",
            product.ProductId,
            $"Urun eklendi: {product.Name}",
            cancellationToken);

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

        var previousIsActive = product.IsActive;
        product.CategoryId = request.CategoryId;
        product.Name = request.Name.Trim();
        product.Price = request.Price;
        product.Description = request.Description.Trim();
        product.Ingredients = request.Content.Trim();
        product.IsActive = request.IsActive;
        await SyncProductTagsAsync(product, request.Tags, cancellationToken);
        await SyncProductVariantsAsync(product, request.Variants, cancellationToken);

        await adminRepository.SaveChangesAsync(cancellationToken);
        await logService.LogAuditAsync(
            product.RestaurantId,
            "ProductUpdated",
            "Product",
            product.ProductId,
            $"Urun guncellendi: {product.Name}",
            cancellationToken);

        if (previousIsActive != product.IsActive)
        {
            await logService.LogAuditAsync(
                product.RestaurantId,
                "ProductStatusChanged",
                "Product",
                product.ProductId,
                $"Urun durumu {(product.IsActive ? "aktif" : "pasif")} yapildi: {product.Name}",
                cancellationToken);
        }

        return MapProduct(product);
    }

    public async Task<bool?> DeleteProductAsync(Guid productId, Guid restaurantId, CancellationToken cancellationToken = default)
    {
        var product = await adminRepository.GetProductAsync(productId, cancellationToken);
        if (product is null)
        {
            return null;
        }

        if (product.RestaurantId != restaurantId)
        {
            throw new UnauthorizedAccessException("Product does not belong to this restaurant.");
        }

        if (await adminRepository.HasOrdersForProductAsync(productId, cancellationToken))
        {
            throw new InvalidOperationException("Product is used in orders and cannot be deleted.");
        }

        try
        {
            var productName = product.Name;
            var tagIds = product.ProductTags
                .Select(productTag => productTag.TagId)
                .Distinct()
                .ToList();

            await adminRepository.DeleteProductAsync(product, cancellationToken);
            await adminRepository.SaveChangesAsync(cancellationToken);

            if (await adminRepository.DeleteUnusedTagsAsync(restaurantId, tagIds, cancellationToken) > 0)
            {
                await adminRepository.SaveChangesAsync(cancellationToken);
            }

            await logService.LogAuditAsync(
                restaurantId,
                "ProductDeleted",
                "Product",
                productId,
                $"Urun silindi: {productName}",
                cancellationToken);
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
        await logService.LogAuditAsync(
            table.RestaurantId,
            "TableCreated",
            "Table",
            table.TableId,
            $"Masa eklendi: {table.Name}",
            cancellationToken);

        return MapTable(table);
    }

    public async Task<AdminTableDto?> UpdateTableAsync(Guid tableId, SaveAdminTableRequestDto request, CancellationToken cancellationToken = default)
    {
        var table = await adminRepository.GetTableAsync(tableId, cancellationToken);
        if (table is null || table.RestaurantId != request.RestaurantId)
        {
            return null;
        }

        var previousIsActive = table.IsActive;
        table.Name = request.Name.Trim();
        table.IsActive = request.IsActive;
        table.QrCodeValue = BuildMenuUrl(table.RestaurantId, table.TableId);

        await adminRepository.SaveChangesAsync(cancellationToken);
        await logService.LogAuditAsync(
            table.RestaurantId,
            "TableUpdated",
            "Table",
            table.TableId,
            $"Masa guncellendi: {table.Name}",
            cancellationToken);

        if (previousIsActive != table.IsActive)
        {
            await logService.LogAuditAsync(
                table.RestaurantId,
                "TableStatusChanged",
                "Table",
                table.TableId,
                $"Masa durumu {(table.IsActive ? "aktif" : "pasif")} yapildi: {table.Name}",
                cancellationToken);
        }

        return MapTable(table);
    }

    public async Task<bool?> DeleteTableAsync(Guid tableId, Guid restaurantId, CancellationToken cancellationToken = default)
    {
        var table = await adminRepository.GetTableAsync(tableId, cancellationToken);
        if (table is null)
        {
            return null;
        }

        if (table.RestaurantId != restaurantId)
        {
            throw new UnauthorizedAccessException("Table does not belong to this restaurant.");
        }

        if (await adminRepository.HasOrdersForTableAsync(tableId, cancellationToken))
        {
            throw new InvalidOperationException("Table has orders and cannot be deleted.");
        }

        try
        {
            var tableName = table.Name;
            await adminRepository.DeleteTableAsync(table, cancellationToken);
            await adminRepository.SaveChangesAsync(cancellationToken);
            await logService.LogAuditAsync(
                restaurantId,
                "TableDeleted",
                "Table",
                tableId,
                $"Masa silindi: {tableName}",
                cancellationToken);
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
            Tags = product.ProductTags
                .OrderBy(productTag => productTag.Tag.Name)
                .Select(productTag => productTag.Tag.Name)
                .ToList(),
            Variants = product.Variants
                .OrderBy(variant => variant.Name)
                .Select(variant => new AdminProductVariantDto
                {
                    ProductVariantId = variant.ProductVariantId,
                    Name = variant.Name,
                    PriceDelta = variant.PriceDelta,
                    IsActive = variant.IsActive
                })
                .ToList(),
            IsActive = product.IsActive
        };
    }

    private async Task SyncProductTagsAsync(
        Product product,
        IReadOnlyCollection<string> rawTags,
        CancellationToken cancellationToken)
    {
        var normalizedTags = NormalizeProductTags(rawTags)
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .Take(12)
            .ToList();

        var existingProductTags = product.ProductTags.ToList();
        var normalizedTagSet = normalizedTags.ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var productTag in existingProductTags)
        {
            if (!normalizedTagSet.Contains(productTag.Tag.NormalizedName))
            {
                product.ProductTags.Remove(productTag);
            }
        }

        foreach (var normalizedTag in normalizedTags)
        {
            if (product.ProductTags.Any(productTag =>
                    string.Equals(productTag.Tag.NormalizedName, normalizedTag, StringComparison.OrdinalIgnoreCase)))
            {
                continue;
            }

            var tag = await adminRepository.GetTagByNormalizedNameAsync(product.RestaurantId, normalizedTag, cancellationToken);
            if (tag is null)
            {
                tag = new Tag
                {
                    TagId = Guid.NewGuid(),
                    RestaurantId = product.RestaurantId,
                    Name = normalizedTag,
                    NormalizedName = normalizedTag
                };
                await adminRepository.AddTagAsync(tag, cancellationToken);
            }

            product.ProductTags.Add(new ProductTag
            {
                ProductTagId = Guid.NewGuid(),
                RestaurantId = product.RestaurantId,
                ProductId = product.ProductId,
                TagId = tag.TagId,
                Tag = tag
            });
        }
    }

    private async Task SyncProductVariantsAsync(
        Product product,
        IReadOnlyCollection<SaveAdminProductVariantRequestDto> rawVariants,
        CancellationToken cancellationToken)
    {
        var variants = NormalizeProductVariants(rawVariants)
            .Take(12)
            .ToList();

        foreach (var variant in variants)
        {
            if (product.Price + variant.PriceDelta < 0)
            {
                throw new InvalidOperationException("Variant final price cannot be negative.");
            }
        }

        var duplicateVariantId = variants
            .Where(variant => variant.ProductVariantId.HasValue)
            .GroupBy(variant => variant.ProductVariantId!.Value)
            .FirstOrDefault(group => group.Count() > 1);

        if (duplicateVariantId is not null)
        {
            throw new InvalidOperationException("The same variant cannot be submitted more than once.");
        }

        var existingVariants = product.Variants.ToList();
        var requestedVariantIds = variants
            .Where(variant => variant.ProductVariantId.HasValue)
            .Select(variant => variant.ProductVariantId!.Value)
            .ToHashSet();

        if (requestedVariantIds.Any(variantId => existingVariants.All(existing => existing.ProductVariantId != variantId)))
        {
            throw new InvalidOperationException("One or more variants do not belong to this product.");
        }

        foreach (var existingVariant in existingVariants)
        {
            if (requestedVariantIds.Contains(existingVariant.ProductVariantId))
            {
                continue;
            }

            if (await adminRepository.HasOrdersForProductVariantAsync(existingVariant.ProductVariantId, cancellationToken))
            {
                existingVariant.IsActive = false;
                continue;
            }

            product.Variants.Remove(existingVariant);
        }

        foreach (var variantRequest in variants)
        {
            ProductVariant? variant = null;
            if (variantRequest.ProductVariantId.HasValue)
            {
                variant = existingVariants.First(existing => existing.ProductVariantId == variantRequest.ProductVariantId.Value);
            }

            if (variant is null)
            {
                product.Variants.Add(new ProductVariant
                {
                    ProductVariantId = Guid.NewGuid(),
                    RestaurantId = product.RestaurantId,
                    ProductId = product.ProductId,
                    Name = variantRequest.Name.Trim(),
                    PriceDelta = variantRequest.PriceDelta,
                    IsActive = variantRequest.IsActive
                });
                continue;
            }

            variant.Name = variantRequest.Name.Trim();
            variant.PriceDelta = variantRequest.PriceDelta;
            variant.IsActive = variantRequest.IsActive;
        }
    }

    private static IReadOnlyCollection<SaveAdminProductVariantRequestDto> NormalizeProductVariants(
        IReadOnlyCollection<SaveAdminProductVariantRequestDto> rawVariants)
    {
        return rawVariants
            .Where(variant => !string.IsNullOrWhiteSpace(variant.Name))
            .Select(variant => new SaveAdminProductVariantRequestDto
            {
                ProductVariantId = variant.ProductVariantId,
                Name = variant.Name.Trim(),
                PriceDelta = variant.PriceDelta,
                IsActive = variant.IsActive
            })
            .ToList();
    }

    private static IReadOnlyCollection<string> NormalizeProductTags(IReadOnlyCollection<string> rawTags)
    {
        return rawTags
            .Select(tag => tag.Trim().ToLowerInvariant())
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
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
