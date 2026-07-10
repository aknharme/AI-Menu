using AiMenu.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Data;

// Seeder, demo sunumunda tum panellerin bos gelmemesi icin ornek restoran verisini ilk acilista kurar.
public static class AppDbSeeder
{
    public static async Task SeedAsync(AppDbContext dbContext)
    {
        // Sabit Guid'ler smoke test ve ekip ici demo adimlarinda ayni kayitlara erisebilmek icin sabit tutulur.
        var restaurantId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var bistroRestaurantId = Guid.Parse("12111111-1111-1111-1111-111111111111");

        var drinksCategoryId = Guid.Parse("22222222-2222-2222-2222-222222222221");
        var burgersCategoryId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var saladsCategoryId = Guid.Parse("22222222-2222-2222-2222-222222222223");
        var dessertsCategoryId = Guid.Parse("22222222-2222-2222-2222-222222222224");
        var breakfastCategoryId = Guid.Parse("22222222-2222-2222-2222-222222222225");
        var mainsCategoryId = Guid.Parse("22222222-2222-2222-2222-222222222226");
        var veganCategoryId = Guid.Parse("22222222-2222-2222-2222-222222222227");
        var hotDrinksCategoryId = Guid.Parse("22222222-2222-2222-2222-222222222228");

        var bistroStartersCategoryId = Guid.Parse("23222222-2222-2222-2222-222222222221");
        var bistroMainsCategoryId = Guid.Parse("23222222-2222-2222-2222-222222222222");
        var bistroSeafoodCategoryId = Guid.Parse("23222222-2222-2222-2222-222222222223");
        var bistroPastasCategoryId = Guid.Parse("23222222-2222-2222-2222-222222222224");
        var bistroDrinksCategoryId = Guid.Parse("23222222-2222-2222-2222-222222222225");
        var bistroDessertsCategoryId = Guid.Parse("23222222-2222-2222-2222-222222222226");

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
        var turkishBreakfastProductId = Guid.Parse("33333333-3333-3333-3333-333333333341");
        var avocadoToastProductId = Guid.Parse("33333333-3333-3333-3333-333333333342");
        var mushroomOmeletteProductId = Guid.Parse("33333333-3333-3333-3333-333333333343");
        var meatballPlateProductId = Guid.Parse("33333333-3333-3333-3333-333333333344");
        var grilledChickenProductId = Guid.Parse("33333333-3333-3333-3333-333333333345");
        var veganBurgerProductId = Guid.Parse("33333333-3333-3333-3333-333333333346");
        var falafelWrapProductId = Guid.Parse("33333333-3333-3333-3333-333333333347");
        var filterCoffeeProductId = Guid.Parse("33333333-3333-3333-3333-333333333348");
        var latteProductId = Guid.Parse("33333333-3333-3333-3333-333333333349");
        var brownieProductId = Guid.Parse("33333333-3333-3333-3333-333333333350");

        var hummusProductId = Guid.Parse("34333333-3333-3333-3333-333333333301");
        var bruschettaProductId = Guid.Parse("34333333-3333-3333-3333-333333333302");
        var steakProductId = Guid.Parse("34333333-3333-3333-3333-333333333303");
        var chickenSkewerProductId = Guid.Parse("34333333-3333-3333-3333-333333333304");
        var grilledSalmonProductId = Guid.Parse("34333333-3333-3333-3333-333333333305");
        var shrimpPastaProductId = Guid.Parse("34333333-3333-3333-3333-333333333306");
        var arrabbiataProductId = Guid.Parse("34333333-3333-3333-3333-333333333307");
        var basilLemonadeProductId = Guid.Parse("34333333-3333-3333-3333-333333333308");
        var berryIcedTeaProductId = Guid.Parse("34333333-3333-3333-3333-333333333309");
        var tiramisuProductId = Guid.Parse("34333333-3333-3333-3333-333333333310");

        var tableOneId = Guid.Parse("44444444-4444-4444-4444-444444444441");
        var tableTwoId = Guid.Parse("44444444-4444-4444-4444-444444444442");
        var terraceTableId = Guid.Parse("44444444-4444-4444-4444-444444444443");
        var bistroTableOneId = Guid.Parse("45444444-4444-4444-4444-444444444441");
        var bistroGardenTableId = Guid.Parse("45444444-4444-4444-4444-444444444442");

        var adminUserId = Guid.Parse("88888888-8888-8888-8888-888888888881");
        var cashierUserId = Guid.Parse("88888888-8888-8888-8888-888888888882");
        var bistroAdminUserId = Guid.Parse("89888888-8888-8888-8888-888888888881");
        var bistroCashierUserId = Guid.Parse("89888888-8888-8888-8888-888888888882");

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
        var kahvaltiTagId = Guid.Parse("55555555-5555-5555-5555-555555555573");
        var veganTagId = Guid.Parse("55555555-5555-5555-5555-555555555574");
        var vejetaryenTagId = Guid.Parse("55555555-5555-5555-5555-555555555575");
        var glutensizTagId = Guid.Parse("55555555-5555-5555-5555-555555555576");
        var laktozsuzTagId = Guid.Parse("55555555-5555-5555-5555-555555555577");
        var aciTagId = Guid.Parse("55555555-5555-5555-5555-555555555578");
        var proteinTagId = Guid.Parse("55555555-5555-5555-5555-555555555579");
        var sekersizTagId = Guid.Parse("55555555-5555-5555-5555-555555555580");
        var balikTagId = Guid.Parse("55555555-5555-5555-5555-555555555581");
        var makarnaTagId = Guid.Parse("55555555-5555-5555-5555-555555555582");
        var premiumTagId = Guid.Parse("55555555-5555-5555-5555-555555555583");
        var paylasimlikTagId = Guid.Parse("55555555-5555-5555-5555-555555555584");
        var bistroPaylasimlikTagId = Guid.Parse("56555555-5555-5555-5555-555555555501");
        var bistroVejetaryenTagId = Guid.Parse("56555555-5555-5555-5555-555555555502");
        var bistroAnaYemekTagId = Guid.Parse("56555555-5555-5555-5555-555555555503");
        var bistroTavukTagId = Guid.Parse("56555555-5555-5555-5555-555555555504");
        var bistroBalikTagId = Guid.Parse("56555555-5555-5555-5555-555555555505");
        var bistroMakarnaTagId = Guid.Parse("56555555-5555-5555-5555-555555555506");
        var bistroAciTagId = Guid.Parse("56555555-5555-5555-5555-555555555507");
        var bistroFerahTagId = Guid.Parse("56555555-5555-5555-5555-555555555508");
        var bistroTatliTagId = Guid.Parse("56555555-5555-5555-5555-555555555509");
        var bistroPremiumTagId = Guid.Parse("56555555-5555-5555-5555-555555555510");
        var bistroSogukTagId = Guid.Parse("56555555-5555-5555-5555-555555555511");

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
        var bistroRestaurant = new Restaurant
        {
            RestaurantId = bistroRestaurantId,
            Name = "AI Bistro",
            Slug = "ai-bistro",
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
            },
            new Category
            {
                CategoryId = breakfastCategoryId,
                RestaurantId = restaurantId,
                Name = "Kahvalti",
                DisplayOrder = 5,
                IsActive = true
            },
            new Category
            {
                CategoryId = mainsCategoryId,
                RestaurantId = restaurantId,
                Name = "Ana Yemekler",
                DisplayOrder = 6,
                IsActive = true
            },
            new Category
            {
                CategoryId = veganCategoryId,
                RestaurantId = restaurantId,
                Name = "Vegan ve Fit",
                DisplayOrder = 7,
                IsActive = true
            },
            new Category
            {
                CategoryId = hotDrinksCategoryId,
                RestaurantId = restaurantId,
                Name = "Sicak Icecekler",
                DisplayOrder = 8,
                IsActive = true
            },
            new Category
            {
                CategoryId = bistroStartersCategoryId,
                RestaurantId = bistroRestaurantId,
                Name = "Baslangiclar",
                DisplayOrder = 1,
                IsActive = true
            },
            new Category
            {
                CategoryId = bistroMainsCategoryId,
                RestaurantId = bistroRestaurantId,
                Name = "Izgara ve Ana Yemek",
                DisplayOrder = 2,
                IsActive = true
            },
            new Category
            {
                CategoryId = bistroSeafoodCategoryId,
                RestaurantId = bistroRestaurantId,
                Name = "Deniz Urunleri",
                DisplayOrder = 3,
                IsActive = true
            },
            new Category
            {
                CategoryId = bistroPastasCategoryId,
                RestaurantId = bistroRestaurantId,
                Name = "Makarnalar",
                DisplayOrder = 4,
                IsActive = true
            },
            new Category
            {
                CategoryId = bistroDrinksCategoryId,
                RestaurantId = bistroRestaurantId,
                Name = "Imza Icecekler",
                DisplayOrder = 5,
                IsActive = true
            },
            new Category
            {
                CategoryId = bistroDessertsCategoryId,
                RestaurantId = bistroRestaurantId,
                Name = "Bistro Tatlilari",
                DisplayOrder = 6,
                IsActive = true
            }
        };

        // Demo urunleri, admin sunumunda hem aktif hem pasif senaryolarini gosterecek sekilde secildi.
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
            },
            new Product
            {
                ProductId = turkishBreakfastProductId,
                RestaurantId = restaurantId,
                CategoryId = breakfastCategoryId,
                Name = "Serpme Kahvalti Tabagi",
                Description = "Peynir, zeytin, bal, kaymak ve sicak ekmek ile zengin kahvalti tabagi.",
                Ingredients = "Beyaz peynir, kasar, zeytin, bal, kaymak, domates, salatalik, yumurta, ekmek.",
                Price = 285m,
                IsActive = true
            },
            new Product
            {
                ProductId = avocadoToastProductId,
                RestaurantId = restaurantId,
                CategoryId = breakfastCategoryId,
                Name = "Avokadolu Tost",
                Description = "Eksi mayali ekmek uzerinde avokado ezmesi ve poshe yumurta.",
                Ingredients = "Eksi mayali ekmek, avokado, yumurta, limon, roka.",
                Price = 185m,
                IsActive = true
            },
            new Product
            {
                ProductId = mushroomOmeletteProductId,
                RestaurantId = restaurantId,
                CategoryId = breakfastCategoryId,
                Name = "Mantarli Omlet",
                Description = "Tereyaginda sotelenmis mantar ve taze otlarla hazirlanan omlet.",
                Ingredients = "Yumurta, mantar, tereyagi, maydanoz, kasar.",
                Price = 145m,
                IsActive = true
            },
            new Product
            {
                ProductId = meatballPlateProductId,
                RestaurantId = restaurantId,
                CategoryId = mainsCategoryId,
                Name = "Izgara Kofte Tabagi",
                Description = "Izgara kofte, pilav, salata ve patates ile servis edilir.",
                Ingredients = "Dana kofte, pirinc pilavi, patates, mevsim salata.",
                Price = 295m,
                IsActive = true
            },
            new Product
            {
                ProductId = grilledChickenProductId,
                RestaurantId = restaurantId,
                CategoryId = mainsCategoryId,
                Name = "Izgara Tavuk Tabagi",
                Description = "Marine tavuk gogsu, sebze ve bulgur pilavi ile hafif ana yemek.",
                Ingredients = "Tavuk gogsu, bulgur, kabak, biber, yogurt sos.",
                Price = 255m,
                IsActive = true
            },
            new Product
            {
                ProductId = veganBurgerProductId,
                RestaurantId = restaurantId,
                CategoryId = veganCategoryId,
                Name = "Vegan Burger",
                Description = "Nohut bazli kofte ve vegan sos ile doyurucu burger.",
                Ingredients = "Nohut koftesi, vegan ekmek, marul, domates, tursu, vegan sos.",
                Price = 215m,
                IsActive = true
            },
            new Product
            {
                ProductId = falafelWrapProductId,
                RestaurantId = restaurantId,
                CategoryId = veganCategoryId,
                Name = "Falafel Wrap",
                Description = "Falafel, tahin sos ve taze yesilliklerle pratik vegan wrap.",
                Ingredients = "Falafel, lavas, tahin sos, marul, domates, maydanoz.",
                Price = 170m,
                IsActive = true
            },
            new Product
            {
                ProductId = filterCoffeeProductId,
                RestaurantId = restaurantId,
                CategoryId = hotDrinksCategoryId,
                Name = "Filtre Kahve",
                Description = "Gunluk cekirdek secimi ile hazirlanan sicak filtre kahve.",
                Ingredients = "Filtre kahve, su.",
                Price = 80m,
                IsActive = true
            },
            new Product
            {
                ProductId = latteProductId,
                RestaurantId = restaurantId,
                CategoryId = hotDrinksCategoryId,
                Name = "Latte",
                Description = "Espresso ve buharla isitilmis sut ile yumusak icimli kahve.",
                Ingredients = "Espresso, sut.",
                Price = 105m,
                IsActive = true
            },
            new Product
            {
                ProductId = brownieProductId,
                RestaurantId = restaurantId,
                CategoryId = dessertsCategoryId,
                Name = "Cikolatali Brownie",
                Description = "Yogun cikolatali, disi hafif citir sicak brownie.",
                Ingredients = "Bitter cikolata, tereyagi, un, yumurta, seker.",
                Price = 135m,
                IsActive = true
            },
            new Product
            {
                ProductId = hummusProductId,
                RestaurantId = bistroRestaurantId,
                CategoryId = bistroStartersCategoryId,
                Name = "Humus ve Zeytinyagli Pita",
                Description = "Tahinli humus, zeytinyagi ve kizarmis pita ile paylasimlik baslangic.",
                Ingredients = "Nohut, tahin, limon, zeytinyagi, pita ekmegi.",
                Price = 155m,
                IsActive = true
            },
            new Product
            {
                ProductId = bruschettaProductId,
                RestaurantId = bistroRestaurantId,
                CategoryId = bistroStartersCategoryId,
                Name = "Domatesli Bruschetta",
                Description = "Feslegenli domates ve sarimsakli kizarmis ekmek.",
                Ingredients = "Ekmek, domates, feslegen, sarimsak, zeytinyagi.",
                Price = 145m,
                IsActive = true
            },
            new Product
            {
                ProductId = steakProductId,
                RestaurantId = bistroRestaurantId,
                CategoryId = bistroMainsCategoryId,
                Name = "Izgara Bonfile",
                Description = "Patates puresi ve mantar sos ile servis edilen premium bonfile.",
                Ingredients = "Dana bonfile, patates, krema, mantar, tereyagi.",
                Price = 620m,
                IsActive = true
            },
            new Product
            {
                ProductId = chickenSkewerProductId,
                RestaurantId = bistroRestaurantId,
                CategoryId = bistroMainsCategoryId,
                Name = "Tavuk Sis",
                Description = "Baharatli tavuk sis, koz sebze ve bulgur ile servis edilir.",
                Ingredients = "Tavuk, biber, sogan, bulgur, yogurtlu sos.",
                Price = 315m,
                IsActive = true
            },
            new Product
            {
                ProductId = grilledSalmonProductId,
                RestaurantId = bistroRestaurantId,
                CategoryId = bistroSeafoodCategoryId,
                Name = "Izgara Somon",
                Description = "Limonlu tereyagi sos ve mevsim sebzeleriyle somon fileto.",
                Ingredients = "Somon, limon, tereyagi, brokoli, kabak.",
                Price = 480m,
                IsActive = true
            },
            new Product
            {
                ProductId = shrimpPastaProductId,
                RestaurantId = bistroRestaurantId,
                CategoryId = bistroPastasCategoryId,
                Name = "Karidesli Linguine",
                Description = "Karides, sarimsak ve domatesli hafif acili linguine.",
                Ingredients = "Linguine, karides, domates, sarimsak, pul biber.",
                Price = 390m,
                IsActive = true
            },
            new Product
            {
                ProductId = arrabbiataProductId,
                RestaurantId = bistroRestaurantId,
                CategoryId = bistroPastasCategoryId,
                Name = "Penne Arrabbiata",
                Description = "Acili domates soslu klasik Italyan makarnasi.",
                Ingredients = "Penne, domates, sarimsak, pul biber, zeytinyagi.",
                Price = 245m,
                IsActive = true
            },
            new Product
            {
                ProductId = basilLemonadeProductId,
                RestaurantId = bistroRestaurantId,
                CategoryId = bistroDrinksCategoryId,
                Name = "Feslegenli Limonata",
                Description = "Taze limon ve feslegenle hazirlanan ferah imza icecek.",
                Ingredients = "Limon, feslegen, su, seker, buz.",
                Price = 115m,
                IsActive = true
            },
            new Product
            {
                ProductId = berryIcedTeaProductId,
                RestaurantId = bistroRestaurantId,
                CategoryId = bistroDrinksCategoryId,
                Name = "Orman Meyveli Ice Tea",
                Description = "Demleme cay ve orman meyvesi puresi ile soguk icecek.",
                Ingredients = "Siyah cay, orman meyvesi puresi, limon, buz.",
                Price = 110m,
                IsActive = true
            },
            new Product
            {
                ProductId = tiramisuProductId,
                RestaurantId = bistroRestaurantId,
                CategoryId = bistroDessertsCategoryId,
                Name = "Tiramisu",
                Description = "Espresso aromali mascarpone kremali klasik tatli.",
                Ingredients = "Mascarpone, espresso, kedi dili, kakao, yumurta.",
                Price = 175m,
                IsActive = true
            }
        };

        // Tag sozlugu, urunleri sade anahtar kelimelerle gruplayabilmek icin tutulur.
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
            new Tag { TagId = doyurucuTagId, RestaurantId = restaurantId, Name = "doyurucu", NormalizedName = "doyurucu" },
            new Tag { TagId = kahvaltiTagId, RestaurantId = restaurantId, Name = "kahvalti", NormalizedName = "kahvalti" },
            new Tag { TagId = veganTagId, RestaurantId = restaurantId, Name = "vegan", NormalizedName = "vegan" },
            new Tag { TagId = vejetaryenTagId, RestaurantId = restaurantId, Name = "vejetaryen", NormalizedName = "vejetaryen" },
            new Tag { TagId = glutensizTagId, RestaurantId = restaurantId, Name = "glutensiz", NormalizedName = "glutensiz" },
            new Tag { TagId = laktozsuzTagId, RestaurantId = restaurantId, Name = "laktozsuz", NormalizedName = "laktozsuz" },
            new Tag { TagId = aciTagId, RestaurantId = restaurantId, Name = "aci", NormalizedName = "aci" },
            new Tag { TagId = proteinTagId, RestaurantId = restaurantId, Name = "protein", NormalizedName = "protein" },
            new Tag { TagId = sekersizTagId, RestaurantId = restaurantId, Name = "sekersiz", NormalizedName = "sekersiz" },
            new Tag { TagId = balikTagId, RestaurantId = restaurantId, Name = "balik", NormalizedName = "balik" },
            new Tag { TagId = makarnaTagId, RestaurantId = restaurantId, Name = "makarna", NormalizedName = "makarna" },
            new Tag { TagId = premiumTagId, RestaurantId = restaurantId, Name = "premium", NormalizedName = "premium" },
            new Tag { TagId = paylasimlikTagId, RestaurantId = restaurantId, Name = "paylasimlik", NormalizedName = "paylasimlik" },
            new Tag { TagId = bistroPaylasimlikTagId, RestaurantId = bistroRestaurantId, Name = "paylasimlik", NormalizedName = "paylasimlik" },
            new Tag { TagId = bistroVejetaryenTagId, RestaurantId = bistroRestaurantId, Name = "vejetaryen", NormalizedName = "vejetaryen" },
            new Tag { TagId = bistroAnaYemekTagId, RestaurantId = bistroRestaurantId, Name = "ana-yemek", NormalizedName = "ana-yemek" },
            new Tag { TagId = bistroTavukTagId, RestaurantId = bistroRestaurantId, Name = "tavuk", NormalizedName = "tavuk" },
            new Tag { TagId = bistroBalikTagId, RestaurantId = bistroRestaurantId, Name = "balik", NormalizedName = "balik" },
            new Tag { TagId = bistroMakarnaTagId, RestaurantId = bistroRestaurantId, Name = "makarna", NormalizedName = "makarna" },
            new Tag { TagId = bistroAciTagId, RestaurantId = bistroRestaurantId, Name = "aci", NormalizedName = "aci" },
            new Tag { TagId = bistroFerahTagId, RestaurantId = bistroRestaurantId, Name = "ferah", NormalizedName = "ferah" },
            new Tag { TagId = bistroTatliTagId, RestaurantId = bistroRestaurantId, Name = "tatli", NormalizedName = "tatli" },
            new Tag { TagId = bistroPremiumTagId, RestaurantId = bistroRestaurantId, Name = "premium", NormalizedName = "premium" },
            new Tag { TagId = bistroSogukTagId, RestaurantId = bistroRestaurantId, Name = "soguk", NormalizedName = "soguk" }
        };

        // ProductTags, urunlerin etiketlerle eslesmesini saglayan iliskidir.
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
            new ProductTag { ProductTagId = Guid.Parse("55555555-5555-5555-5555-555555555572"), RestaurantId = restaurantId, ProductId = classicBurgerProductId, TagId = doyurucuTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555501"), RestaurantId = restaurantId, ProductId = turkishBreakfastProductId, TagId = kahvaltiTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555502"), RestaurantId = restaurantId, ProductId = turkishBreakfastProductId, TagId = paylasimlikTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555503"), RestaurantId = restaurantId, ProductId = avocadoToastProductId, TagId = kahvaltiTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555504"), RestaurantId = restaurantId, ProductId = avocadoToastProductId, TagId = vejetaryenTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555505"), RestaurantId = restaurantId, ProductId = mushroomOmeletteProductId, TagId = kahvaltiTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555506"), RestaurantId = restaurantId, ProductId = mushroomOmeletteProductId, TagId = proteinTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555507"), RestaurantId = restaurantId, ProductId = meatballPlateProductId, TagId = anaYemekTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555508"), RestaurantId = restaurantId, ProductId = meatballPlateProductId, TagId = proteinTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555509"), RestaurantId = restaurantId, ProductId = grilledChickenProductId, TagId = tavukTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555510"), RestaurantId = restaurantId, ProductId = grilledChickenProductId, TagId = hafifTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555511"), RestaurantId = restaurantId, ProductId = veganBurgerProductId, TagId = veganTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555512"), RestaurantId = restaurantId, ProductId = veganBurgerProductId, TagId = burgerTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555513"), RestaurantId = restaurantId, ProductId = falafelWrapProductId, TagId = veganTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555514"), RestaurantId = restaurantId, ProductId = falafelWrapProductId, TagId = hafifTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555515"), RestaurantId = restaurantId, ProductId = filterCoffeeProductId, TagId = kahveTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555516"), RestaurantId = restaurantId, ProductId = latteProductId, TagId = kahveTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555517"), RestaurantId = restaurantId, ProductId = brownieProductId, TagId = tatliTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555518"), RestaurantId = bistroRestaurantId, ProductId = hummusProductId, TagId = bistroPaylasimlikTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555519"), RestaurantId = bistroRestaurantId, ProductId = hummusProductId, TagId = bistroVejetaryenTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555520"), RestaurantId = bistroRestaurantId, ProductId = bruschettaProductId, TagId = bistroVejetaryenTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555521"), RestaurantId = bistroRestaurantId, ProductId = steakProductId, TagId = bistroAnaYemekTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555522"), RestaurantId = bistroRestaurantId, ProductId = steakProductId, TagId = bistroPremiumTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555523"), RestaurantId = bistroRestaurantId, ProductId = chickenSkewerProductId, TagId = bistroTavukTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555524"), RestaurantId = bistroRestaurantId, ProductId = grilledSalmonProductId, TagId = bistroBalikTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555525"), RestaurantId = bistroRestaurantId, ProductId = grilledSalmonProductId, TagId = bistroPremiumTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555526"), RestaurantId = bistroRestaurantId, ProductId = shrimpPastaProductId, TagId = bistroMakarnaTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555527"), RestaurantId = bistroRestaurantId, ProductId = shrimpPastaProductId, TagId = bistroAciTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555528"), RestaurantId = bistroRestaurantId, ProductId = arrabbiataProductId, TagId = bistroMakarnaTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555529"), RestaurantId = bistroRestaurantId, ProductId = arrabbiataProductId, TagId = bistroAciTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555530"), RestaurantId = bistroRestaurantId, ProductId = basilLemonadeProductId, TagId = bistroFerahTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555531"), RestaurantId = bistroRestaurantId, ProductId = basilLemonadeProductId, TagId = bistroSogukTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555532"), RestaurantId = bistroRestaurantId, ProductId = berryIcedTeaProductId, TagId = bistroSogukTagId },
            new ProductTag { ProductTagId = Guid.Parse("57555555-5555-5555-5555-555555555533"), RestaurantId = bistroRestaurantId, ProductId = tiramisuProductId, TagId = bistroTatliTagId }
        };

        // Alerjenler, urun detay drawer'inda musterinin hizli karar vermesine yardim eder.
        var productAllergens = new List<ProductAllergen>
        {
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666661"), RestaurantId = restaurantId, ProductId = classicBurgerProductId, Name = "gluten" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666662"), RestaurantId = restaurantId, ProductId = classicBurgerProductId, Name = "sut urunu" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666663"), RestaurantId = restaurantId, ProductId = chickenBurgerProductId, Name = "gluten" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666664"), RestaurantId = restaurantId, ProductId = caesarSaladProductId, Name = "sut urunu" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666665"), RestaurantId = restaurantId, ProductId = cheesecakeProductId, Name = "yumurta" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666666"), RestaurantId = restaurantId, ProductId = turkishBreakfastProductId, Name = "sut urunu" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666667"), RestaurantId = restaurantId, ProductId = avocadoToastProductId, Name = "gluten" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666668"), RestaurantId = restaurantId, ProductId = mushroomOmeletteProductId, Name = "yumurta" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666669"), RestaurantId = restaurantId, ProductId = latteProductId, Name = "sut urunu" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("66666666-6666-6666-6666-666666666670"), RestaurantId = restaurantId, ProductId = brownieProductId, Name = "gluten" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("67666666-6666-6666-6666-666666666601"), RestaurantId = bistroRestaurantId, ProductId = bruschettaProductId, Name = "gluten" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("67666666-6666-6666-6666-666666666602"), RestaurantId = bistroRestaurantId, ProductId = steakProductId, Name = "sut urunu" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("67666666-6666-6666-6666-666666666603"), RestaurantId = bistroRestaurantId, ProductId = grilledSalmonProductId, Name = "balik" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("67666666-6666-6666-6666-666666666604"), RestaurantId = bistroRestaurantId, ProductId = shrimpPastaProductId, Name = "kabuklu deniz urunu" },
            new ProductAllergen { ProductAllergenId = Guid.Parse("67666666-6666-6666-6666-666666666605"), RestaurantId = bistroRestaurantId, ProductId = tiramisuProductId, Name = "yumurta" }
        };

        // Varyantlar, demo siparis akisinda ekstra fiyat farklarini gormek icin eklenir.
        var productVariants = new List<ProductVariant>
        {
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777771"), RestaurantId = restaurantId, ProductId = classicBurgerProductId, Name = "Ekstra cheddar", PriceDelta = 30m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777772"), RestaurantId = restaurantId, ProductId = classicBurgerProductId, Name = "Cift kofte", PriceDelta = 90m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777773"), RestaurantId = restaurantId, ProductId = lemonadeProductId, Name = "Sekersiz", PriceDelta = 0m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777774"), RestaurantId = restaurantId, ProductId = americanoProductId, Name = "Ekstra shot", PriceDelta = 25m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777775"), RestaurantId = restaurantId, ProductId = latteProductId, Name = "Badem sutu", PriceDelta = 20m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777776"), RestaurantId = restaurantId, ProductId = latteProductId, Name = "Laktozsuz sut", PriceDelta = 15m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777777"), RestaurantId = restaurantId, ProductId = filterCoffeeProductId, Name = "Buyuk boy", PriceDelta = 25m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777778"), RestaurantId = restaurantId, ProductId = meatballPlateProductId, Name = "Ekstra kofte", PriceDelta = 95m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777779"), RestaurantId = restaurantId, ProductId = grilledChickenProductId, Name = "Acili sos", PriceDelta = 10m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("77777777-7777-7777-7777-777777777780"), RestaurantId = restaurantId, ProductId = veganBurgerProductId, Name = "Glutensiz ekmek", PriceDelta = 25m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("78777777-7777-7777-7777-777777777701"), RestaurantId = bistroRestaurantId, ProductId = steakProductId, Name = "Mantar sos", PriceDelta = 45m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("78777777-7777-7777-7777-777777777702"), RestaurantId = bistroRestaurantId, ProductId = steakProductId, Name = "Ekstra patates puresi", PriceDelta = 55m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("78777777-7777-7777-7777-777777777703"), RestaurantId = bistroRestaurantId, ProductId = shrimpPastaProductId, Name = "Ekstra karides", PriceDelta = 110m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("78777777-7777-7777-7777-777777777704"), RestaurantId = bistroRestaurantId, ProductId = arrabbiataProductId, Name = "Daha acili", PriceDelta = 0m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("78777777-7777-7777-7777-777777777705"), RestaurantId = bistroRestaurantId, ProductId = basilLemonadeProductId, Name = "Sekersiz", PriceDelta = 0m, IsActive = true },
            new ProductVariant { ProductVariantId = Guid.Parse("78777777-7777-7777-7777-777777777706"), RestaurantId = bistroRestaurantId, ProductId = tiramisuProductId, Name = "Cift porsiyon", PriceDelta = 130m, IsActive = true }
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
            },
            new Table
            {
                TableId = bistroTableOneId,
                RestaurantId = bistroRestaurantId,
                Name = "Bistro Masa 1",
                QrCodeValue = BuildMenuUrl(bistroRestaurantId, bistroTableOneId),
                IsActive = true
            },
            new Table
            {
                TableId = bistroGardenTableId,
                RestaurantId = bistroRestaurantId,
                Name = "Bahce 1",
                QrCodeValue = BuildMenuUrl(bistroRestaurantId, bistroGardenTableId),
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

        var bistroAdminUser = new User
        {
            UserId = bistroAdminUserId,
            RestaurantId = bistroRestaurantId,
            FullName = "AI Bistro Admin",
            Email = "admin@aibistro.com",
            Role = "Admin",
            IsActive = true,
            CreatedAtUtc = threeHoursAgo
        };
        bistroAdminUser.PasswordHash = passwordHasher.HashPassword(bistroAdminUser, "Admin123!");

        var bistroCashierUser = new User
        {
            UserId = bistroCashierUserId,
            RestaurantId = bistroRestaurantId,
            FullName = "AI Bistro Cashier",
            Email = "cashier@aibistro.com",
            Role = "Cashier",
            IsActive = true,
            CreatedAtUtc = threeHoursAgo
        };
        bistroCashierUser.PasswordHash = passwordHasher.HashPassword(bistroCashierUser, "Cashier123!");

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

        // Seed her acilista calisabilir; mevcut kayitlari atlayip sadece eksikleri tamamlar.
        var existingRestaurantIds = await dbContext.Restaurants
            .AsNoTracking()
            .Select(currentRestaurant => currentRestaurant.RestaurantId)
            .ToHashSetAsync();
        var existingRestaurantSlugs = await dbContext.Restaurants
            .AsNoTracking()
            .Select(currentRestaurant => currentRestaurant.Slug)
            .ToHashSetAsync(StringComparer.OrdinalIgnoreCase);

        var restaurantsToAdd = new[] { restaurant, bistroRestaurant }
            .Where(currentRestaurant =>
                !existingRestaurantIds.Contains(currentRestaurant.RestaurantId) &&
                !existingRestaurantSlugs.Contains(currentRestaurant.Slug))
            .ToList();
        if (restaurantsToAdd.Count > 0)
        {
            await dbContext.Restaurants.AddRangeAsync(restaurantsToAdd);
        }

        var existingUserIds = await dbContext.Users
            .AsNoTracking()
            .Select(user => user.UserId)
            .ToHashSetAsync();
        var existingUserEmails = await dbContext.Users
            .AsNoTracking()
            .Select(user => user.Email)
            .ToHashSetAsync(StringComparer.OrdinalIgnoreCase);

        var usersToAdd = new[] { adminUser, cashierUser, bistroAdminUser, bistroCashierUser }
            .Where(user => !existingUserIds.Contains(user.UserId) && !existingUserEmails.Contains(user.Email))
            .ToList();
        if (usersToAdd.Count > 0)
        {
            await dbContext.Users.AddRangeAsync(usersToAdd);
        }

        var existingCategoryIds = await dbContext.Categories
            .AsNoTracking()
            .Select(category => category.CategoryId)
            .ToHashSetAsync();
        var categoriesToAdd = categories
            .Where(category => !existingCategoryIds.Contains(category.CategoryId))
            .ToList();
        if (categoriesToAdd.Count > 0)
        {
            await dbContext.Categories.AddRangeAsync(categoriesToAdd);
        }

        var existingProductIds = await dbContext.Products
            .AsNoTracking()
            .Select(product => product.ProductId)
            .ToHashSetAsync();
        var productsToAdd = products
            .Where(product => !existingProductIds.Contains(product.ProductId))
            .ToList();
        if (productsToAdd.Count > 0)
        {
            await dbContext.Products.AddRangeAsync(productsToAdd);
        }

        var existingTagIds = await dbContext.Tags
            .AsNoTracking()
            .Select(tag => tag.TagId)
            .ToHashSetAsync();
        var existingTagKeys = await dbContext.Tags
            .AsNoTracking()
            .Select(tag => $"{tag.RestaurantId}:{tag.NormalizedName}")
            .ToHashSetAsync(StringComparer.OrdinalIgnoreCase);
        var tagsToAdd = tags
            .Where(tag =>
                !existingTagIds.Contains(tag.TagId) &&
                !existingTagKeys.Contains($"{tag.RestaurantId}:{tag.NormalizedName}"))
            .ToList();
        if (tagsToAdd.Count > 0)
        {
            await dbContext.Tags.AddRangeAsync(tagsToAdd);
        }

        var existingProductTagIds = await dbContext.ProductTags
            .AsNoTracking()
            .Select(productTag => productTag.ProductTagId)
            .ToHashSetAsync();
        var existingProductTagPairs = await dbContext.ProductTags
            .AsNoTracking()
            .Select(productTag => $"{productTag.ProductId}:{productTag.TagId}")
            .ToHashSetAsync();
        var productTagsToAdd = productTags
            .Where(productTag =>
                !existingProductTagIds.Contains(productTag.ProductTagId) &&
                !existingProductTagPairs.Contains($"{productTag.ProductId}:{productTag.TagId}"))
            .ToList();
        if (productTagsToAdd.Count > 0)
        {
            await dbContext.ProductTags.AddRangeAsync(productTagsToAdd);
        }

        var existingAllergenIds = await dbContext.ProductAllergens
            .AsNoTracking()
            .Select(productAllergen => productAllergen.ProductAllergenId)
            .ToHashSetAsync();
        var allergensToAdd = productAllergens
            .Where(productAllergen => !existingAllergenIds.Contains(productAllergen.ProductAllergenId))
            .ToList();
        if (allergensToAdd.Count > 0)
        {
            await dbContext.ProductAllergens.AddRangeAsync(allergensToAdd);
        }

        var existingVariantIds = await dbContext.ProductVariants
            .AsNoTracking()
            .Select(productVariant => productVariant.ProductVariantId)
            .ToHashSetAsync();
        var variantsToAdd = productVariants
            .Where(productVariant => !existingVariantIds.Contains(productVariant.ProductVariantId))
            .ToList();
        if (variantsToAdd.Count > 0)
        {
            await dbContext.ProductVariants.AddRangeAsync(variantsToAdd);
        }

        var existingTableIds = await dbContext.Tables
            .AsNoTracking()
            .Select(table => table.TableId)
            .ToHashSetAsync();
        var tablesToAdd = tables
            .Where(table => !existingTableIds.Contains(table.TableId))
            .ToList();
        if (tablesToAdd.Count > 0)
        {
            await dbContext.Tables.AddRangeAsync(tablesToAdd);
        }

        var existingOrderIds = await dbContext.Orders
            .AsNoTracking()
            .Select(order => order.OrderId)
            .ToHashSetAsync();
        var ordersToAdd = orders
            .Where(order => !existingOrderIds.Contains(order.OrderId))
            .ToList();
        if (ordersToAdd.Count > 0)
        {
            await dbContext.Orders.AddRangeAsync(ordersToAdd);
        }

        var existingOrderItemIds = await dbContext.OrderItems
            .AsNoTracking()
            .Select(orderItem => orderItem.OrderItemId)
            .ToHashSetAsync();
        var orderItemsToAdd = orderItems
            .Where(orderItem => !existingOrderItemIds.Contains(orderItem.OrderItemId))
            .ToList();
        if (orderItemsToAdd.Count > 0)
        {
            await dbContext.OrderItems.AddRangeAsync(orderItemsToAdd);
        }

        var existingOrderStatusLogIds = await dbContext.OrderStatusLogs
            .AsNoTracking()
            .Select(orderStatusLog => orderStatusLog.OrderStatusLogId)
            .ToHashSetAsync();
        var orderStatusLogsToAdd = orderStatusLogs
            .Where(orderStatusLog => !existingOrderStatusLogIds.Contains(orderStatusLog.OrderStatusLogId))
            .ToList();
        if (orderStatusLogsToAdd.Count > 0)
        {
            await dbContext.OrderStatusLogs.AddRangeAsync(orderStatusLogsToAdd);
        }

        var existingAuditLogIds = await dbContext.AuditLogs
            .AsNoTracking()
            .Select(auditLog => auditLog.AuditLogId)
            .ToHashSetAsync();
        var auditLogsToAdd = auditLogs
            .Where(auditLog => !existingAuditLogIds.Contains(auditLog.AuditLogId))
            .ToList();
        if (auditLogsToAdd.Count > 0)
        {
            await dbContext.AuditLogs.AddRangeAsync(auditLogsToAdd);
        }

        if (dbContext.ChangeTracker.HasChanges())
        {
            await dbContext.SaveChangesAsync();
        }
    }

    // QR degeri, customer uygulamasinin restaurant ve masa baglamini tek baglantida yakalayabilmesi icin uretilir.
    private static string BuildMenuUrl(Guid restaurantId, Guid tableId)
    {
        return $"/menu?restaurantId={restaurantId}&tableId={tableId}";
    }
}
