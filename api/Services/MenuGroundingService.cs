using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;

namespace AiMenu.Api.Services;

public class MenuGroundingService : IMenuGroundingService
{
    private const int ProductLimit = 4;

    private enum MenuCategoryIntent
    {
        None,
        Drink,
        Food,
        Dessert,
        Salad,
        Burger,
        Coffee
    }

    public AiMenuGroundingDto Ground(string message, AiMenuContextDto menuContext)
    {
        var normalizedMessage = Normalize(message);
        var queryType = DetectQueryType(normalizedMessage);

        if (IsAlcoholQuestion(normalizedMessage))
        {
            var alcoholicProducts = menuContext.Products
                .Where(IsAlcoholicProduct)
                .Take(ProductLimit)
                .ToList();

            return new AiMenuGroundingDto
            {
                QueryType = alcoholicProducts.Count == 0 ? "unavailable_category" : queryType,
                HasSpecificGrounding = alcoholicProducts.Count > 0,
                Context = new AiMenuContextDto
                {
                    RestaurantId = menuContext.RestaurantId,
                    RestaurantName = menuContext.RestaurantName,
                    Products = alcoholicProducts
                },
                SuggestedProducts = alcoholicProducts.Select(ToSuggestedProduct).ToList()
            };
        }

        if (IsCartGuidanceRequest(normalizedMessage))
        {
            var requestedProducts = FindTargetProducts(normalizedMessage, menuContext.Products);
            if (requestedProducts.Count > 0)
            {
                return new AiMenuGroundingDto
                {
                    QueryType = "cart_guidance",
                    HasSpecificGrounding = true,
                    Context = new AiMenuContextDto
                    {
                        RestaurantId = menuContext.RestaurantId,
                        RestaurantName = menuContext.RestaurantName,
                        Products = requestedProducts
                    },
                    SuggestedProducts = requestedProducts
                        .Take(ProductLimit)
                        .Select(ToSuggestedProduct)
                        .ToList()
                };
            }
        }

        var categoryIntent = DetectCategoryIntent(normalizedMessage);
        if (categoryIntent != MenuCategoryIntent.None)
        {
            var categoryProducts = FindProductsByCategoryIntent(categoryIntent, menuContext.Products);
            var refinedProducts = FindProductsBySoftSearch(normalizedMessage, categoryProducts);
            var categoryScopedProducts = refinedProducts.Count > 0 ? refinedProducts : categoryProducts.Take(ProductLimit).ToList();
            categoryScopedProducts = ApplyAttributeFilters(normalizedMessage, categoryScopedProducts);

            return new AiMenuGroundingDto
            {
                QueryType = queryType,
                HasSpecificGrounding = categoryScopedProducts.Count > 0,
                Context = new AiMenuContextDto
                {
                    RestaurantId = menuContext.RestaurantId,
                    RestaurantName = menuContext.RestaurantName,
                    Products = categoryScopedProducts
                },
                SuggestedProducts = categoryScopedProducts
                    .Take(ProductLimit)
                    .Select(ToSuggestedProduct)
                    .ToList()
            };
        }

        var targetProducts = FindTargetProducts(normalizedMessage, menuContext.Products);
        var hasSpecificGrounding = targetProducts.Count > 0;

        if (targetProducts.Count == 0)
        {
            targetProducts = FindProductsByCategory(normalizedMessage, menuContext.Products);
        }

        if (targetProducts.Count == 0)
        {
            targetProducts = FindProductsBySoftSearch(normalizedMessage, menuContext.Products);
        }

        if (targetProducts.Count == 0 && IsGeneralMenuQuestion(normalizedMessage))
        {
            targetProducts = menuContext.Products.Take(ProductLimit).ToList();
        }

        var scopedProducts = targetProducts.Count > 0
            ? targetProducts
            : menuContext.Products.ToList();
        scopedProducts = ApplyAttributeFilters(normalizedMessage, scopedProducts);

        return new AiMenuGroundingDto
        {
            QueryType = queryType,
            HasSpecificGrounding = hasSpecificGrounding,
            Context = new AiMenuContextDto
            {
                RestaurantId = menuContext.RestaurantId,
                RestaurantName = menuContext.RestaurantName,
                Products = scopedProducts
            },
            SuggestedProducts = scopedProducts
                .Take(ProductLimit)
                .Select(ToSuggestedProduct)
                .ToList()
        };
    }

    private static List<AiMenuProductContextDto> FindTargetProducts(
        string normalizedMessage,
        IReadOnlyCollection<AiMenuProductContextDto> products)
    {
        var scoredProducts = products
            .Select(product => new
            {
                Product = product,
                Score = GetProductNameScore(normalizedMessage, product)
            })
            .Where(item => item.Score >= 20)
            .OrderByDescending(item => item.Score)
            .ThenBy(item => item.Product.Name)
            .Take(ProductLimit)
            .ToList();

        if (scoredProducts.Count == 0)
        {
            return new List<AiMenuProductContextDto>();
        }

        if (IsCartGuidanceRequest(normalizedMessage))
        {
            return scoredProducts.Select(item => item.Product).ToList();
        }

        var bestScore = scoredProducts[0].Score;
        return scoredProducts
            .Where(item => item.Score >= bestScore - 10)
            .Select(item => item.Product)
            .ToList();
    }

    private static int GetProductNameScore(string normalizedMessage, AiMenuProductContextDto product)
    {
        var normalizedName = Normalize(product.Name);
        if (normalizedMessage.Contains(normalizedName))
        {
            return 100;
        }

        var nameTokens = SplitTokens(normalizedName).Where(token => token.Length > 2).ToList();
        if (nameTokens.Count == 0)
        {
            return 0;
        }

        var matchedNameTokens = nameTokens.Count(normalizedMessage.Contains);
        if (matchedNameTokens == 0)
        {
            return 0;
        }

        var score = matchedNameTokens * 30;
        if (matchedNameTokens == nameTokens.Count)
        {
            score += 25;
        }

        return score;
    }

    private static List<AiMenuProductContextDto> FindProductsByCategory(
        string normalizedMessage,
        IReadOnlyCollection<AiMenuProductContextDto> products)
    {
        var categoryIntent = DetectCategoryIntent(normalizedMessage);
        return categoryIntent == MenuCategoryIntent.None
            ? new List<AiMenuProductContextDto>()
            : FindProductsByCategoryIntent(categoryIntent, products);
    }

    private static List<AiMenuProductContextDto> FindProductsByCategoryIntent(
        MenuCategoryIntent categoryIntent,
        IReadOnlyCollection<AiMenuProductContextDto> products)
    {
        return categoryIntent switch
        {
            MenuCategoryIntent.Drink => products
                .Where(IsDrink)
                .Take(ProductLimit)
                .ToList(),
            MenuCategoryIntent.Coffee => products
                .Where(product => ContainsAny(Normalize(SearchText(product)), "kahve", "americano", "espresso", "latte", "cappuccino"))
                .Take(ProductLimit)
                .ToList(),
            MenuCategoryIntent.Salad => products
                .Where(product => ContainsAny(Normalize(SearchText(product)), "salata", "caesar", "kase", "bowl"))
                .Take(ProductLimit)
                .ToList(),
            MenuCategoryIntent.Burger => products
                .Where(product => Normalize(SearchText(product)).Contains("burger"))
                .Take(ProductLimit)
                .ToList(),
            MenuCategoryIntent.Dessert => products
                .Where(product => ContainsAny(Normalize(SearchText(product)), "tatli", "dessert", "cheesecake", "waffle", "pasta"))
                .Take(ProductLimit)
                .ToList(),
            MenuCategoryIntent.Food => products
                .Where(product => !IsDrink(product) && !IsDessert(product))
                .Take(ProductLimit)
                .ToList(),
            _ => new List<AiMenuProductContextDto>()
        };
    }

    private static List<AiMenuProductContextDto> FindProductsBySoftSearch(
        string normalizedMessage,
        IReadOnlyCollection<AiMenuProductContextDto> products)
    {
        var tokens = ExpandSearchTokens(SplitTokens(normalizedMessage)
            .Where(token => token.Length > 2)
            .Except(new[]
            {
                "var", "neler", "hangi", "bana", "bir", "sey", "icin", "doyurucu", "hafif",
                "fiyat", "ucret", "oner", "istiyorum", "siparis", "yaninda", "gider",
                "icecek", "icmek", "sivi", "yemek", "yiyecek", "tatli"
            })
            .ToList());

        if (tokens.Count == 0)
        {
            return new List<AiMenuProductContextDto>();
        }

        return products
            .Select(product => new
            {
                Product = product,
                Score = tokens.Count(token => Normalize(SearchText(product)).Contains(token))
            })
            .Where(item => item.Score > 0)
            .OrderByDescending(item => item.Score)
            .ThenBy(item => item.Product.Name)
            .Take(ProductLimit)
            .Select(item => item.Product)
            .ToList();
    }

    private static List<AiMenuProductContextDto> ApplyAttributeFilters(
        string normalizedMessage,
        List<AiMenuProductContextDto> products)
    {
        var filteredProducts = products;

        if (ContainsAny(normalizedMessage, "tavuk", "tavuklu"))
        {
            filteredProducts = filteredProducts
                .Where(product => ContainsAny(Normalize(SearchText(product)), "tavuk", "tavuklu"))
                .ToList();
        }
        else if (ContainsAny(normalizedMessage, "etli", "et", "dana", "kofte", "köfte", "kirmizi et"))
        {
            filteredProducts = filteredProducts
                .Where(product => ContainsAny(Normalize(SearchText(product)), "dana", "kofte", "etli", "kirmizi et"))
                .ToList();
        }

        return filteredProducts.Count > 0 ? filteredProducts.Take(ProductLimit).ToList() : products.Take(ProductLimit).ToList();
    }

    private static string DetectQueryType(string normalizedMessage)
    {
        if (IsCartGuidanceRequest(normalizedMessage))
        {
            return "cart_guidance";
        }

        if (ContainsAny(normalizedMessage, "fiyat", "ucret", "kac tl"))
        {
            return "price";
        }

        if (ContainsAny(normalizedMessage, "icinde", "icerik", "alerjen"))
        {
            return "ingredients";
        }

        if (ContainsAny(normalizedMessage, "doyurucu", "hafif", "aci"))
        {
            return "product_detail";
        }

        if (ContainsAny(normalizedMessage, "yaninda", "gider", "uyar"))
        {
            return "compatibility";
        }

        if (ContainsAny(normalizedMessage, "oner", "tavsiye"))
        {
            return "recommendation";
        }

        return "menu_question";
    }

    private static bool IsGeneralMenuQuestion(string normalizedMessage)
    {
        return ContainsAny(normalizedMessage, "menu", "ne var", "neler var", "hangi", "yemek", "yiyecek", "icecek", "icmek", "sivi", "oner");
    }

    private static bool IsDrink(AiMenuProductContextDto product)
    {
        return ContainsAny(
            Normalize(product.CategoryName + " " + product.Name + " " + string.Join(' ', product.Tags)),
            "icecek", "kahve", "mesrubat", "limonata", "soda", "kola", "americano", "espresso");
    }

    private static bool IsDessert(AiMenuProductContextDto product)
    {
        return ContainsAny(Normalize(SearchText(product)), "tatli", "dessert", "cheesecake", "waffle", "pasta");
    }

    private static bool IsAlcoholQuestion(string normalizedMessage)
    {
        return ContainsAny(normalizedMessage, "alkol", "alkollu", "bira", "sarap", "raki", "kokteyl", "viski");
    }

    private static bool IsAlcoholicProduct(AiMenuProductContextDto product)
    {
        return ContainsAny(Normalize(SearchText(product)), "alkol", "alkollu", "bira", "sarap", "raki", "kokteyl", "viski");
    }

    private static bool IsCartGuidanceRequest(string normalizedMessage)
    {
        return ContainsAny(normalizedMessage, "siparis", "sepete", "adet") ||
            normalizedMessage.Any(char.IsDigit);
    }

    private static MenuCategoryIntent DetectCategoryIntent(string normalizedMessage)
    {
        if (ContainsAny(normalizedMessage, "kahve", "espresso", "americano", "latte", "cappuccino"))
        {
            return MenuCategoryIntent.Coffee;
        }

        if (ContainsAny(normalizedMessage,
                "icecek", "icmek", "iceyim", "icelim", "sivi", "mesrubat", "soguk bir sey",
                "soguk bisey", "ferah bir sey", "ferah bisey", "limonata", "soda", "kola"))
        {
            return MenuCategoryIntent.Drink;
        }

        if (ContainsAny(normalizedMessage, "salata", "caesar", "kase", "bowl"))
        {
            return MenuCategoryIntent.Salad;
        }

        if (ContainsAny(normalizedMessage, "burger"))
        {
            return MenuCategoryIntent.Burger;
        }

        if (ContainsAny(normalizedMessage, "tatli", "dessert", "pasta", "cheesecake", "waffle"))
        {
            return MenuCategoryIntent.Dessert;
        }

        if (ContainsAny(normalizedMessage, "yemek", "yiyecek", "karin", "aciktim", "ana yemek", "doyurucu"))
        {
            return MenuCategoryIntent.Food;
        }

        return MenuCategoryIntent.None;
    }

    private static List<string> ExpandSearchTokens(IReadOnlyCollection<string> tokens)
    {
        var expandedTokens = new HashSet<string>(tokens);

        if (tokens.Any(token => token is "eksi" or "ekşi"))
        {
            expandedTokens.Add("limon");
            expandedTokens.Add("limonata");
            expandedTokens.Add("narenciye");
        }

        if (tokens.Any(token => token is "ferah" or "serin" or "soguk"))
        {
            expandedTokens.Add("buz");
            expandedTokens.Add("limon");
            expandedTokens.Add("soda");
        }

        if (tokens.Any(token => token is "hafif"))
        {
            expandedTokens.Add("ferah");
            expandedTokens.Add("salata");
        }

        return expandedTokens.ToList();
    }

    private static string SearchText(AiMenuProductContextDto product)
    {
        return string.Join(' ', new[]
        {
            product.Name,
            product.CategoryName,
            product.Description,
            product.Ingredients,
            string.Join(' ', product.Tags)
        });
    }

    private static AiSuggestedProductDto ToSuggestedProduct(AiMenuProductContextDto product)
    {
        return new AiSuggestedProductDto
        {
            Id = product.ProductId,
            Name = product.Name,
            Price = product.Price,
            Description = product.Description
        };
    }

    private static IReadOnlyCollection<string> SplitTokens(string value)
    {
        return value.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }

    private static bool ContainsAny(string value, params string[] needles)
    {
        return needles.Any(value.Contains);
    }

    private static string Normalize(string value)
    {
        return value
            .Trim()
            .ToLowerInvariant()
            .Replace("sezar", "caesar")
            .Replace('ı', 'i')
            .Replace('ğ', 'g')
            .Replace('ü', 'u')
            .Replace('ş', 's')
            .Replace('ö', 'o')
            .Replace('ç', 'c');
    }
}
