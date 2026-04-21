using AiMenu.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Data;

// Seeder, uygulama ilk calistiginda bos veritabani icin ornek veri olusturur.
public static class AppDbSeeder
{
    public static async Task SeedAsync(AppDbContext dbContext)
    {
        // Veri varsa yeniden ekleme yapmayiz; seed islemi idempotent kalir.
        if (await dbContext.Restaurants.AnyAsync())
        {
            return;
        }

        // Sabit Guid'ler smoke test ve ekip ici ornek istekler icin bilerek sabit tutuluyor.
        var restaurantId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var drinksCategoryId = Guid.Parse("22222222-2222-2222-2222-222222222221");
        var burgersCategoryId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var colaProductId = Guid.Parse("33333333-3333-3333-3333-333333333331");
        var burgerProductId = Guid.Parse("33333333-3333-3333-3333-333333333332");
        var lemonadeProductId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var inactiveProductId = Guid.Parse("33333333-3333-3333-3333-333333333334");
        var tableOneId = Guid.Parse("44444444-4444-4444-4444-444444444441");

        var restaurant = new Restaurant
        {
            RestaurantId = restaurantId,
            Name = "Demo Cafe",
            Slug = "demo-cafe",
            IsActive = true
        };

        var categories = new List<Category>
        {
            new Category
            {
                CategoryId = drinksCategoryId,
                RestaurantId = restaurantId,
                Name = "Icecekler",
                DisplayOrder = 1,
                IsActive = true
            },
            new Category
            {
                CategoryId = burgersCategoryId,
                RestaurantId = restaurantId,
                Name = "Burgerler",
                DisplayOrder = 2,
                IsActive = true
            }
        };

        var products = new List<Product>
        {
            new Product
            {
                ProductId = colaProductId,
                RestaurantId = restaurantId,
                CategoryId = drinksCategoryId,
                Name = "Kola",
                Description = "Soguk servis edilen klasik kola.",
                Ingredients = "Karbondioksitli su, seker, aroma vericiler.",
                Price = 55m,
                IsActive = true
            },
            new Product
            {
                ProductId = burgerProductId,
                RestaurantId = restaurantId,
                CategoryId = burgersCategoryId,
                Name = "Klasik Burger",
                Description = "Dana kofte, cheddar ve ozel sos ile servis edilir.",
                Ingredients = "Dana kofte, cheddar, marul, domates, tursu, burger ekmegi, ozel sos.",
                Price = 220m,
                IsActive = true
            },
            new Product
            {
                ProductId = lemonadeProductId,
                RestaurantId = restaurantId,
                CategoryId = drinksCategoryId,
                Name = "Ev Yapimi Limonata",
                Description = "Taze limon, nane ve buz ile hazirlanir.",
                Ingredients = "Limon suyu, su, seker, taze nane.",
                Price = 75m,
                IsActive = true
            },
            new Product
            {
                ProductId = inactiveProductId,
                RestaurantId = restaurantId,
                CategoryId = burgersCategoryId,
                Name = "Gizli Test Burger",
                Description = "Pasif urun oldugu icin musteri menusunde gorunmemelidir.",
                Ingredients = "Test icerik.",
                Price = 1m,
                IsActive = false
            }
        };

        // Tag'ler AI tarafında üretilecek etiketlerle eşleşebilecek sade anahtar kelimelerdir.
        var productTags = new List<ProductTag>
        {
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555551"), RestaurantId = restaurantId, ProductId = colaProductId, Name = "soguk" },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555552"), RestaurantId = restaurantId, ProductId = colaProductId, Name = "gazli" },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555553"), RestaurantId = restaurantId, ProductId = burgerProductId, Name = "burger" },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555554"), RestaurantId = restaurantId, ProductId = burgerProductId, Name = "ana-yemek" },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555555"), RestaurantId = restaurantId, ProductId = lemonadeProductId, Name = "ferah" },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555556"), RestaurantId = restaurantId, ProductId = lemonadeProductId, Name = "icecek" }
        };

        // Alerjenler sadece ürün detayında müşteriye bilgilendirme için döndürülür.
        var productAllergens = new List<ProductAllergen>
        {
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666661"), RestaurantId = restaurantId, ProductId = burgerProductId, Name = "gluten" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666662"), RestaurantId = restaurantId, ProductId = burgerProductId, Name = "sut urunu" }
        };

        // Varyantlar ana ürün fiyatının üzerine eklenen fiyat farklarını temsil eder.
        var productVariants = new List<ProductVariant>
        {
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777771"), RestaurantId = restaurantId, ProductId = burgerProductId, Name = "Ekstra cheddar", PriceDelta = 30m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777772"), RestaurantId = restaurantId, ProductId = burgerProductId, Name = "Cift kofte", PriceDelta = 90m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777773"), RestaurantId = restaurantId, ProductId = lemonadeProductId, Name = "Sekersiz", PriceDelta = 0m, IsActive = true }
        };

        var table = new Table
        {
            TableId = tableOneId,
            RestaurantId = restaurantId,
            Name = "Masa 1",
            // QR tarandiginda frontend bu degeri kullanarak restoran/masa baglamini yakalayabilir.
            QrCodeValue = "demo-cafe-table-1",
            IsActive = true
        };

        await dbContext.Restaurants.AddAsync(restaurant);
        await dbContext.Categories.AddRangeAsync(categories);
        await dbContext.Products.AddRangeAsync(products);
        await dbContext.ProductTags.AddRangeAsync(productTags);
        await dbContext.ProductAllergens.AddRangeAsync(productAllergens);
        await dbContext.ProductVariants.AddRangeAsync(productVariants);
        await dbContext.Tables.AddAsync(table);
        await dbContext.SaveChangesAsync();
    }
}
