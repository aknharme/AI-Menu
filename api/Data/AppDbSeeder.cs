using AiMenu.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Data;

// Seeder, uygulama ilk calistiginda bos veritabani icin ornek veri olusturur.
public static class AppDbSeeder
{
    public static async Task SeedAsync(AppDbContext dbContext)
    {
        // InMemory veya yeni olusan veritabaninda tablolarin hazir olmasini garanti eder.
        await dbContext.Database.EnsureCreatedAsync();

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
                Price = 55m,
                IsActive = true,
                Tags = new List<string> { "soguk", "icecek", "gazli" }
            },
            new Product
            {
                ProductId = burgerProductId,
                RestaurantId = restaurantId,
                CategoryId = burgersCategoryId,
                Name = "Klasik Burger",
                Description = "Dana kofte, cheddar ve ozel sos ile servis edilir.",
                Price = 220m,
                IsActive = true,
                Tags = new List<string> { "burger", "dana", "ana-yemek" }
            }
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
        await dbContext.Tables.AddAsync(table);
        await dbContext.SaveChangesAsync();
    }
}
