using AiMenu.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Data;

// Seeder, demo sunumunda tum panellerin bos gelmemesi icin ornek restoran verisini ilk acilista kurar.
public static class AppDbSeeder
{
    public static async Task SeedAsync(AppDbContext dbContext)
    {
        // Veri varsa yeniden ekleme yapmayiz; seed islemi idempotent kalir.
        if (await dbContext.Restaurants.AnyAsync())
        {
            return;
        }

        // Sabit Guid'ler smoke test ve ekip ici demo adimlarinda ayni kayitlara erisebilmek icin sabit tutulur.
        var restaurantId = Guid.Parse("11111111-1111-1111-1111-111111111111");

        var drinksCategoryId = Guid.Parse("22222222-2222-2222-2222-222222222221");
        var burgersCategoryId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var saladsCategoryId = Guid.Parse("22222222-2222-2222-2222-222222222223");
        var dessertsCategoryId = Guid.Parse("22222222-2222-2222-2222-222222222224");

        var colaProductId = Guid.Parse("33333333-3333-3333-3333-333333333331");
        var classicBurgerProductId = Guid.Parse("33333333-3333-3333-3333-333333333332");
        var lemonadeProductId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var inactiveBurgerProductId = Guid.Parse("33333333-3333-3333-3333-333333333334");
        var americanoProductId = Guid.Parse("33333333-3333-3333-3333-333333333335");
        var strawberrySodaProductId = Guid.Parse("33333333-3333-3333-3333-333333333336");
        var chickenBurgerProductId = Guid.Parse("33333333-3333-3333-3333-333333333337");
        var caesarSaladProductId = Guid.Parse("33333333-3333-3333-3333-333333333338");
        var mediterraneanBowlProductId = Guid.Parse("33333333-3333-3333-3333-333333333339");
        var cheesecakeProductId = Guid.Parse("33333333-3333-3333-3333-333333333340");

        var tableOneId = Guid.Parse("44444444-4444-4444-4444-444444444441");
        var tableTwoId = Guid.Parse("44444444-4444-4444-4444-444444444442");
        var terraceTableId = Guid.Parse("44444444-4444-4444-4444-444444444443");

        var adminUserId = Guid.Parse("88888888-8888-8888-8888-888888888881");
        var cashierUserId = Guid.Parse("88888888-8888-8888-8888-888888888882");

        var sogukTagId = Guid.Parse("55555555-5555-5555-5555-555555555541");
        var gazliTagId = Guid.Parse("55555555-5555-5555-5555-555555555542");
        var burgerTagId = Guid.Parse("55555555-5555-5555-5555-555555555543");
        var anaYemekTagId = Guid.Parse("55555555-5555-5555-5555-555555555544");
        var ferahTagId = Guid.Parse("55555555-5555-5555-5555-555555555545");
        var icecekTagId = Guid.Parse("55555555-5555-5555-5555-555555555546");
        var hafifTagId = Guid.Parse("55555555-5555-5555-5555-555555555547");
        var tavukTagId = Guid.Parse("55555555-5555-5555-5555-555555555548");
        var kahveTagId = Guid.Parse("55555555-5555-5555-5555-555555555549");
        var salataTagId = Guid.Parse("55555555-5555-5555-5555-555555555550");
        var tatliTagId = Guid.Parse("55555555-5555-5555-5555-555555555560");
        var doyurucuTagId = Guid.Parse("55555555-5555-5555-5555-555555555561");

        var now = DateTimeOffset.UtcNow;
        var threeHoursAgo = now.AddHours(-3);
        var ninetyMinutesAgo = now.AddMinutes(-90);
        var fortyMinutesAgo = now.AddMinutes(-40);
        var thirtyMinutesAgo = now.AddMinutes(-30);
        var fifteenMinutesAgo = now.AddMinutes(-15);
        var tenMinutesAgo = now.AddMinutes(-10);
        var fiveMinutesAgo = now.AddMinutes(-5);

        var restaurant = new Restaurant
        {
            RestaurantId = restaurantId,
            Name = "Demo Cafe",
            Slug = "demo-cafe",
            IsActive = true
        };

        // Kategoriler, demo sirasinda musterinin menude farkli bolumler gormesini saglar.
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
            },
            new Category
            {
                CategoryId = saladsCategoryId,
                RestaurantId = restaurantId,
                Name = "Salata ve Kaseler",
                DisplayOrder = 3,
                IsActive = true
            },
            new Category
            {
                CategoryId = dessertsCategoryId,
                RestaurantId = restaurantId,
                Name = "Tatlilar",
                DisplayOrder = 4,
                IsActive = true
            }
        };

        // Demo urunleri, admin ve recommendation sunumunda hem aktif hem pasif senaryolarini gosterecek sekilde secildi.
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
                ProductId = classicBurgerProductId,
                RestaurantId = restaurantId,
                CategoryId = burgersCategoryId,
                Name = "Klasik Burger",
                Description = "Dana kofte, cheddar ve ev yapimi sos ile servis edilir.",
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
                ProductId = inactiveBurgerProductId,
                RestaurantId = restaurantId,
                CategoryId = burgersCategoryId,
                Name = "Gizli Test Burger",
                Description = "Pasif urun oldugu icin musteri menusunde gorunmemelidir.",
                Ingredients = "Test icerik.",
                Price = 1m,
                IsActive = false
            },
            new Product
            {
                ProductId = americanoProductId,
                RestaurantId = restaurantId,
                CategoryId = drinksCategoryId,
                Name = "Iced Americano",
                Description = "Yogun espresso bazli soguk kahve.",
                Ingredients = "Espresso, su, buz.",
                Price = 95m,
                IsActive = true
            },
            new Product
            {
                ProductId = strawberrySodaProductId,
                RestaurantId = restaurantId,
                CategoryId = drinksCategoryId,
                Name = "Cilekli Soda",
                Description = "Taze cilek puresi ile ferah soda karisimi.",
                Ingredients = "Maden suyu, cilek puresi, limon, buz.",
                Price = 85m,
                IsActive = true
            },
            new Product
            {
                ProductId = chickenBurgerProductId,
                RestaurantId = restaurantId,
                CategoryId = burgersCategoryId,
                Name = "Tavuk Burger",
                Description = "Citir tavuk, coleslaw ve hardal sos ile sunulur.",
                Ingredients = "Citir tavuk, burger ekmegi, coleslaw, hardal sos.",
                Price = 205m,
                IsActive = true
            },
            new Product
            {
                ProductId = caesarSaladProductId,
                RestaurantId = restaurantId,
                CategoryId = saladsCategoryId,
                Name = "Caesar Salata",
                Description = "Tavuklu ve parmesanli hafif ogun secenegi.",
                Ingredients = "Marul, tavuk, parmesan, kruton, caesar sos.",
                Price = 190m,
                IsActive = true
            },
            new Product
            {
                ProductId = mediterraneanBowlProductId,
                RestaurantId = restaurantId,
                CategoryId = saladsCategoryId,
                Name = "Akdeniz Kasesi",
                Description = "Nohut, kinoali ve renkli sebzeli hafif bowl.",
                Ingredients = "Kinoa, nohut, roka, domates, salatalik, zeytinyagi.",
                Price = 175m,
                IsActive = true
            },
            new Product
            {
                ProductId = cheesecakeProductId,
                RestaurantId = restaurantId,
                CategoryId = dessertsCategoryId,
                Name = "San Sebastian",
                Description = "Akiskan dokulu imza cheesecake.",
                Ingredients = "Krema peynir, krema, seker, yumurta.",
                Price = 160m,
                IsActive = true
            }
        };

        // Tag sozlugu, Ollama'nin urettigi etiketlerle urunlerin hizli eslesmesi icin sade anahtar kelimeler tutar.
        var tags = new List<Tag>
        {
            new Tag { TagId = sogukTagId, RestaurantId = restaurantId, Name = "soguk", NormalizedName = "soguk" },
            new Tag { TagId = gazliTagId, RestaurantId = restaurantId, Name = "gazli", NormalizedName = "gazli" },
            new Tag { TagId = burgerTagId, RestaurantId = restaurantId, Name = "burger", NormalizedName = "burger" },
            new Tag { TagId = anaYemekTagId, RestaurantId = restaurantId, Name = "ana-yemek", NormalizedName = "ana-yemek" },
            new Tag { TagId = ferahTagId, RestaurantId = restaurantId, Name = "ferah", NormalizedName = "ferah" },
            new Tag { TagId = icecekTagId, RestaurantId = restaurantId, Name = "icecek", NormalizedName = "icecek" },
            new Tag { TagId = hafifTagId, RestaurantId = restaurantId, Name = "hafif", NormalizedName = "hafif" },
            new Tag { TagId = tavukTagId, RestaurantId = restaurantId, Name = "tavuk", NormalizedName = "tavuk" },
            new Tag { TagId = kahveTagId, RestaurantId = restaurantId, Name = "kahve", NormalizedName = "kahve" },
            new Tag { TagId = salataTagId, RestaurantId = restaurantId, Name = "salata", NormalizedName = "salata" },
            new Tag { TagId = tatliTagId, RestaurantId = restaurantId, Name = "tatli", NormalizedName = "tatli" },
            new Tag { TagId = doyurucuTagId, RestaurantId = restaurantId, Name = "doyurucu", NormalizedName = "doyurucu" }
        };

        // ProductTags, recommendation endpoint'inin basic relevance hesaplamasi icin dogrudan kullandigi iliskidir.
        var productTags = new List<ProductTag>
        {
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555551"), RestaurantId = restaurantId, ProductId = colaProductId, TagId = sogukTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555552"), RestaurantId = restaurantId, ProductId = colaProductId, TagId = gazliTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555553"), RestaurantId = restaurantId, ProductId = classicBurgerProductId, TagId = burgerTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555554"), RestaurantId = restaurantId, ProductId = classicBurgerProductId, TagId = anaYemekTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555555"), RestaurantId = restaurantId, ProductId = lemonadeProductId, TagId = ferahTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555556"), RestaurantId = restaurantId, ProductId = lemonadeProductId, TagId = icecekTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555557"), RestaurantId = restaurantId, ProductId = lemonadeProductId, TagId = hafifTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555558"), RestaurantId = restaurantId, ProductId = americanoProductId, TagId = kahveTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555559"), RestaurantId = restaurantId, ProductId = americanoProductId, TagId = sogukTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555562"), RestaurantId = restaurantId, ProductId = strawberrySodaProductId, TagId = sogukTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555563"), RestaurantId = restaurantId, ProductId = strawberrySodaProductId, TagId = ferahTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555564"), RestaurantId = restaurantId, ProductId = chickenBurgerProductId, TagId = tavukTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555565"), RestaurantId = restaurantId, ProductId = chickenBurgerProductId, TagId = doyurucuTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555566"), RestaurantId = restaurantId, ProductId = caesarSaladProductId, TagId = hafifTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555567"), RestaurantId = restaurantId, ProductId = caesarSaladProductId, TagId = tavukTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555568"), RestaurantId = restaurantId, ProductId = caesarSaladProductId, TagId = salataTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555569"), RestaurantId = restaurantId, ProductId = mediterraneanBowlProductId, TagId = hafifTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555570"), RestaurantId = restaurantId, ProductId = mediterraneanBowlProductId, TagId = salataTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555571"), RestaurantId = restaurantId, ProductId = cheesecakeProductId, TagId = tatliTagId },
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555572"), RestaurantId = restaurantId, ProductId = classicBurgerProductId, TagId = doyurucuTagId }
        };

        // Alerjenler, urun detay drawer'inda musterinin hizli karar vermesine yardim eder.
        var productAllergens = new List<ProductAllergen>
        {
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666661"), RestaurantId = restaurantId, ProductId = classicBurgerProductId, Name = "gluten" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666662"), RestaurantId = restaurantId, ProductId = classicBurgerProductId, Name = "sut urunu" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666663"), RestaurantId = restaurantId, ProductId = chickenBurgerProductId, Name = "gluten" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666664"), RestaurantId = restaurantId, ProductId = caesarSaladProductId, Name = "sut urunu" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666665"), RestaurantId = restaurantId, ProductId = cheesecakeProductId, Name = "yumurta" }
        };

        // Varyantlar, demo siparis akisinda ekstra fiyat farklarini gormek icin eklenir.
        var productVariants = new List<ProductVariant>
        {
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777771"), RestaurantId = restaurantId, ProductId = classicBurgerProductId, Name = "Ekstra cheddar", PriceDelta = 30m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777772"), RestaurantId = restaurantId, ProductId = classicBurgerProductId, Name = "Cift kofte", PriceDelta = 90m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777773"), RestaurantId = restaurantId, ProductId = lemonadeProductId, Name = "Sekersiz", PriceDelta = 0m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777774"), RestaurantId = restaurantId, ProductId = americanoProductId, Name = "Ekstra shot", PriceDelta = 25m, IsActive = true }
        };

        // Birden fazla masa, cashier ekraninda farkli masalardan gelen siparislerin ayrismasini gosterir.
        var tables = new List<Table>
        {
            new Table
            {
                TableId = tableOneId,
                RestaurantId = restaurantId,
                Name = "Masa 1",
                QrCodeValue = BuildMenuUrl(restaurantId, tableOneId),
                IsActive = true
            },
            new Table
            {
                TableId = tableTwoId,
                RestaurantId = restaurantId,
                Name = "Masa 2",
                QrCodeValue = BuildMenuUrl(restaurantId, tableTwoId),
                IsActive = true
            },
            new Table
            {
                TableId = terraceTableId,
                RestaurantId = restaurantId,
                Name = "Teras 1",
                QrCodeValue = BuildMenuUrl(restaurantId, terraceTableId),
                IsActive = true
            }
        };

        var passwordHasher = new PasswordHasher<User>();

        // Demo kullanicilari, admin ve cashier panellerinin sunumunda dogrudan kullanilacak sabit hesaplardir.
        var adminUser = new User
        {
            UserId = adminUserId,
            RestaurantId = restaurantId,
            FullName = "Demo Admin",
            Email = "admin@demo.com",
            Role = "Admin",
            IsActive = true,
            CreatedAtUtc = threeHoursAgo
        };
        adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, "Admin123!");

        var cashierUser = new User
        {
            UserId = cashierUserId,
            RestaurantId = restaurantId,
            FullName = "Demo Cashier",
            Email = "cashier@demo.com",
            Role = "Cashier",
            IsActive = true,
            CreatedAtUtc = threeHoursAgo
        };
        cashierUser.PasswordHash = passwordHasher.HashPassword(cashierUser, "Cashier123!");

        // Gecmis siparisler, dashboard kartlari ve cashier listesi icin acilis verisi saglar.
        var orders = new List<Order>
        {
            new Order
            {
                OrderId = Guid.Parse("99999999-9999-9999-9999-999999999901"),
                RestaurantId = restaurantId,
                TableId = tableOneId,
                CustomerName = "Ayse",
                Note = "Sos ayri gelsin.",
                Status = "Paid",
                TotalAmount = 350m,
                CreatedAtUtc = ninetyMinutesAgo
            },
            new Order
            {
                OrderId = Guid.Parse("99999999-9999-9999-9999-999999999902"),
                RestaurantId = restaurantId,
                TableId = tableTwoId,
                CustomerName = "Mert",
                Note = "Icecekler once gelsin.",
                Status = "Ready",
                TotalAmount = 290m,
                CreatedAtUtc = fortyMinutesAgo
            },
            new Order
            {
                OrderId = Guid.Parse("99999999-9999-9999-9999-999999999903"),
                RestaurantId = restaurantId,
                TableId = terraceTableId,
                CustomerName = "Zeynep",
                Note = "Tatli sonra gelsin.",
                Status = "Pending",
                TotalAmount = 255m,
                CreatedAtUtc = tenMinutesAgo
            }
        };

        // Order item satirlari, populer urun ve toplam ciro hesaplari icin yeterli cesitlilik saglar.
        var orderItems = new List<OrderItem>
        {
            new OrderItem
            {
                OrderItemId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"),
                RestaurantId = restaurantId,
                OrderId = orders[0].OrderId,
                ProductId = classicBurgerProductId,
                ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777771"),
                Note = "Az pismis olsun.",
                Quantity = 1,
                UnitPrice = 250m,
                LineTotal = 250m
            },
            new OrderItem
            {
                OrderItemId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2"),
                RestaurantId = restaurantId,
                OrderId = orders[0].OrderId,
                ProductId = colaProductId,
                Quantity = 1,
                UnitPrice = 55m,
                LineTotal = 55m
            },
            new OrderItem
            {
                OrderItemId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3"),
                RestaurantId = restaurantId,
                OrderId = orders[0].OrderId,
                ProductId = lemonadeProductId,
                Quantity = 1,
                UnitPrice = 75m,
                LineTotal = 75m
            },
            new OrderItem
            {
                OrderItemId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4"),
                RestaurantId = restaurantId,
                OrderId = orders[1].OrderId,
                ProductId = chickenBurgerProductId,
                Quantity = 1,
                UnitPrice = 205m,
                LineTotal = 205m
            },
            new OrderItem
            {
                OrderItemId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5"),
                RestaurantId = restaurantId,
                OrderId = orders[1].OrderId,
                ProductId = strawberrySodaProductId,
                Quantity = 1,
                UnitPrice = 85m,
                LineTotal = 85m
            },
            new OrderItem
            {
                OrderItemId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6"),
                RestaurantId = restaurantId,
                OrderId = orders[2].OrderId,
                ProductId = caesarSaladProductId,
                Quantity = 1,
                UnitPrice = 190m,
                LineTotal = 190m
            },
            new OrderItem
            {
                OrderItemId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7"),
                RestaurantId = restaurantId,
                OrderId = orders[2].OrderId,
                ProductId = lemonadeProductId,
                ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777773"),
                Quantity = 1,
                UnitPrice = 65m,
                LineTotal = 65m
            }
        };

        // Siparis durum loglari, cashier paneli ve audit gorunumunde kronolojik gecmisi hazir eder.
        var orderStatusLogs = new List<OrderStatusLog>
        {
            new OrderStatusLog
            {
                OrderStatusLogId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1"),
                RestaurantId = restaurantId,
                OrderId = orders[0].OrderId,
                OldStatus = null,
                NewStatus = "Pending",
                ChangedAtUtc = ninetyMinutesAgo,
                ChangedByUserId = null
            },
            new OrderStatusLog
            {
                OrderStatusLogId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2"),
                RestaurantId = restaurantId,
                OrderId = orders[0].OrderId,
                OldStatus = "Pending",
                NewStatus = "Preparing",
                ChangedAtUtc = now.AddMinutes(-80),
                ChangedByUserId = cashierUserId
            },
            new OrderStatusLog
            {
                OrderStatusLogId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3"),
                RestaurantId = restaurantId,
                OrderId = orders[0].OrderId,
                OldStatus = "Preparing",
                NewStatus = "Paid",
                ChangedAtUtc = now.AddMinutes(-70),
                ChangedByUserId = cashierUserId
            },
            new OrderStatusLog
            {
                OrderStatusLogId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4"),
                RestaurantId = restaurantId,
                OrderId = orders[1].OrderId,
                OldStatus = null,
                NewStatus = "Pending",
                ChangedAtUtc = fortyMinutesAgo,
                ChangedByUserId = null
            },
            new OrderStatusLog
            {
                OrderStatusLogId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5"),
                RestaurantId = restaurantId,
                OrderId = orders[1].OrderId,
                OldStatus = "Pending",
                NewStatus = "Preparing",
                ChangedAtUtc = thirtyMinutesAgo,
                ChangedByUserId = cashierUserId
            },
            new OrderStatusLog
            {
                OrderStatusLogId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6"),
                RestaurantId = restaurantId,
                OrderId = orders[1].OrderId,
                OldStatus = "Preparing",
                NewStatus = "Ready",
                ChangedAtUtc = fifteenMinutesAgo,
                ChangedByUserId = cashierUserId
            },
            new OrderStatusLog
            {
                OrderStatusLogId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7"),
                RestaurantId = restaurantId,
                OrderId = orders[2].OrderId,
                OldStatus = null,
                NewStatus = "Pending",
                ChangedAtUtc = tenMinutesAgo,
                ChangedByUserId = null
            }
        };

        // Recommendation loglari, dashboard'daki onerilen urun istatistiklerinin demo acilisinda dolu gelmesini saglar.
        var recommendationLogs = new List<RecommendationLog>
        {
            new RecommendationLog
            {
                RecommendationLogId = Guid.Parse("cccccccc-cccc-cccc-cccc-ccccccccccc1"),
                RestaurantId = restaurantId,
                Prompt = "hafif ama doyurucu bir sey istiyorum",
                ExtractedTags = "[\"hafif\",\"doyurucu\"]",
                RecommendedProducts = $"[\"{caesarSaladProductId}\",\"{mediterraneanBowlProductId}\",\"{classicBurgerProductId}\"]",
                CreatedAtUtc = now.AddMinutes(-35)
            },
            new RecommendationLog
            {
                RecommendationLogId = Guid.Parse("cccccccc-cccc-cccc-cccc-ccccccccccc2"),
                RestaurantId = restaurantId,
                Prompt = "tavuklu bir sey olsun",
                ExtractedTags = "[\"tavuk\"]",
                RecommendedProducts = $"[\"{chickenBurgerProductId}\",\"{caesarSaladProductId}\"]",
                CreatedAtUtc = now.AddMinutes(-22)
            },
            new RecommendationLog
            {
                RecommendationLogId = Guid.Parse("cccccccc-cccc-cccc-cccc-ccccccccccc3"),
                RestaurantId = restaurantId,
                Prompt = "soguk bir icecek istiyorum",
                ExtractedTags = "[\"soguk\",\"icecek\"]",
                RecommendedProducts = $"[\"{lemonadeProductId}\",\"{colaProductId}\",\"{strawberrySodaProductId}\"]",
                CreatedAtUtc = fiveMinutesAgo
            }
        };

        // Audit loglari, admin panelindeki log ekraninin dogrudan kullanima hazir gelmesini saglar.
        var auditLogs = new List<AuditLog>
        {
            new AuditLog
            {
                AuditLogId = Guid.Parse("dddddddd-dddd-dddd-dddd-ddddddddddd1"),
                RestaurantId = restaurantId,
                UserId = adminUserId,
                ActionType = "CategoryCreated",
                EntityType = "Category",
                EntityId = saladsCategoryId,
                Description = "Salata ve Kaseler kategorisi eklendi.",
                CreatedAtUtc = now.AddDays(-1)
            },
            new AuditLog
            {
                AuditLogId = Guid.Parse("dddddddd-dddd-dddd-dddd-ddddddddddd2"),
                RestaurantId = restaurantId,
                UserId = adminUserId,
                ActionType = "ProductUpdated",
                EntityType = "Product",
                EntityId = classicBurgerProductId,
                Description = "Klasik Burger fiyat ve aciklama bilgisi guncellendi.",
                CreatedAtUtc = now.AddHours(-6)
            },
            new AuditLog
            {
                AuditLogId = Guid.Parse("dddddddd-dddd-dddd-dddd-ddddddddddd3"),
                RestaurantId = restaurantId,
                UserId = adminUserId,
                ActionType = "TableCreated",
                EntityType = "Table",
                EntityId = terraceTableId,
                Description = "Teras 1 masasi ve QR baglantisi olusturuldu.",
                CreatedAtUtc = now.AddHours(-2)
            }
        };

        await dbContext.Restaurants.AddAsync(restaurant);
        await dbContext.Users.AddRangeAsync(adminUser, cashierUser);
        await dbContext.Categories.AddRangeAsync(categories);
        await dbContext.Products.AddRangeAsync(products);
        await dbContext.Tags.AddRangeAsync(tags);
        await dbContext.ProductTags.AddRangeAsync(productTags);
        await dbContext.ProductAllergens.AddRangeAsync(productAllergens);
        await dbContext.ProductVariants.AddRangeAsync(productVariants);
        await dbContext.Tables.AddRangeAsync(tables);
        await dbContext.Orders.AddRangeAsync(orders);
        await dbContext.OrderItems.AddRangeAsync(orderItems);
        await dbContext.OrderStatusLogs.AddRangeAsync(orderStatusLogs);
        await dbContext.RecommendationLogs.AddRangeAsync(recommendationLogs);
        await dbContext.AuditLogs.AddRangeAsync(auditLogs);
        await dbContext.SaveChangesAsync();
    }

    // QR degeri, customer uygulamasinin restaurant ve masa baglamini tek baglantida yakalayabilmesi icin uretilir.
    private static string BuildMenuUrl(Guid restaurantId, Guid tableId)
    {
        return $"/menu?restaurantId={restaurantId}&tableId={tableId}";
    }
}
