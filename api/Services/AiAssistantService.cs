using System.Net.Http.Json;
using System.Text.Json;
using AiMenu.Api.DTOs;
using AiMenu.Api.Options;
using AiMenu.Api.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace AiMenu.Api.Services;

public class AiAssistantService(HttpClient httpClient, IOptions<OllamaOptions> options) : IAiAssistantService
{
    private const int SuggestedProductLimit = 4;
    private readonly OllamaOptions ollamaOptions = options.Value;

    public async Task<AiMessageResponseDto> ReplyAsync(
        string message,
        AiMenuContextDto menuContext,
        CancellationToken cancellationToken = default)
    {
        if (menuContext.Products.Count == 0)
        {
            return new AiMessageResponseDto
            {
                Intent = AiMessageIntent.MenuRelated.ToResponseValue(),
                Reply = "Bu restoran için aktif menü ürünü görünmüyor.",
                SuggestedProducts = Array.Empty<AiSuggestedProductDto>()
            };
        }

        try
        {
            var request = new OllamaGenerateRequest
            {
                Model = ollamaOptions.Model,
                Stream = false,
                Prompt = BuildAssistantPrompt(message, menuContext)
            };

            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCts.CancelAfter(TimeSpan.FromSeconds(Math.Max(5, ollamaOptions.TimeoutSeconds)));

            var response = await httpClient.PostAsJsonAsync("/api/generate", request, timeoutCts.Token);
            response.EnsureSuccessStatusCode();

            var payload = await response.Content.ReadFromJsonAsync<OllamaGenerateResponse>(cancellationToken: timeoutCts.Token);
            var modelResponse = ParseAssistantResponse(payload?.Response ?? string.Empty);
            var suggestedProducts = ResolveSuggestedProducts(modelResponse, menuContext);
            suggestedProducts = MergeSuggestions(FindRelevantProducts(message, menuContext), suggestedProducts);
            suggestedProducts = ApplyQuestionScope(message, suggestedProducts, menuContext);
            if (IsCartGuidanceRequest(Normalize(message)))
            {
                suggestedProducts = MergeSuggestions(FindRelevantProducts(message, menuContext), suggestedProducts);
            }

            if (suggestedProducts.Count == 0)
            {
                suggestedProducts = FindRelevantProducts(message, menuContext);
            }

            return new AiMessageResponseDto
            {
                Intent = AiMessageIntent.MenuRelated.ToResponseValue(),
                Reply = BuildSafeReply(message, modelResponse.Reply, menuContext, suggestedProducts),
                SuggestedProducts = suggestedProducts
            };
        }
        catch
        {
            var suggestedProducts = FindRelevantProducts(message, menuContext);
            return new AiMessageResponseDto
            {
                Intent = AiMessageIntent.MenuRelated.ToResponseValue(),
                Reply = BuildSafeReply(message, string.Empty, menuContext, suggestedProducts),
                SuggestedProducts = suggestedProducts
            };
        }
    }

    private static string BuildSafeReply(
        string message,
        string modelReply,
        AiMenuContextDto menuContext,
        IReadOnlyCollection<AiSuggestedProductDto> suggestedProducts)
    {
        var normalized = Normalize(message);
        if (IsCartGuidanceRequest(normalized))
        {
            return "Tabii, bu ürünleri menüden seçip sepete manuel olarak ekleyebilirsiniz. Siparişi tamamlamak için sepeti kullanmanız gerekiyor.";
        }

        if (IsProductDetailQuestion(normalized) && suggestedProducts.Count > 0)
        {
            return BuildProductDetailReply(normalized, suggestedProducts.First());
        }

        return string.IsNullOrWhiteSpace(modelReply)
                    ? BuildFallbackReply(message, menuContext, suggestedProducts)
                    : modelReply.Trim();
    }

    private static string BuildAssistantPrompt(string message, AiMenuContextDto menuContext)
    {
        return
            """
            Sen restoran menu asistanisin.
            Sadece verilen aktif menu context'ine gore cevap ver.
            Menude olmayan urunleri onerme.
            Urun uydurma.
            Fiyatlari sadece context'ten kullan.
            Siparis olusturma.
            Sepete urun ekleme.
            Kullanici siparis vermek isterse onu urunu manuel olarak sepete eklemeye yonlendir.

            Kullanicinin asil sorusunu anla:
            - Eger bilgi soruyorsa, once bilgi ver.
            - Eger oneri istiyorsa, oneri yap.
            - Eger iki urunun uyumunu soruyorsa, kisa yorum yap ve sadece menudeki urunlerle cevap ver.
            - Eger urunun doyuruculugunu, hafifligini, aciligini veya icerigini soruyorsa menu aciklamasina gore cevap ver.
            - Eger kullanici yiyecekleri soruyorsa icecekleri listeleme.
            - Eger kullanici icecekleri soruyorsa yiyecekleri listeleme.
            - Sadece urun listelemekle yetinme.
            - Ilk cumlede soruya dogrudan cevap ver.
            - Cevap 2-3 cumle olsun.
            - Dogal, kisa ve musteri dostu Turkce kullan.

            Sadece JSON don. Aciklama yazma.
            Format:
            {
              "reply": "kisa cevap",
              "suggestedProductIds": ["menu-context-product-id"],
              "suggestedProductNames": ["urun adi"]
            }

            Aktif menu context:
            """ + Environment.NewLine + BuildMenuContextText(menuContext) + Environment.NewLine +
            """

            Kullanici mesaji:
            """ + message;
    }

    private static string BuildMenuContextText(AiMenuContextDto menuContext)
    {
        var lines = menuContext.Products.Select(product =>
        {
            var details = new List<string>
            {
                "id=" + product.ProductId,
                "ad=" + product.Name,
                "kategori=" + product.CategoryName,
                "fiyat=" + product.Price + " TL"
            };

            if (!string.IsNullOrWhiteSpace(product.Description))
            {
                details.Add("aciklama=" + product.Description);
            }

            if (!string.IsNullOrWhiteSpace(product.Ingredients))
            {
                details.Add("icerik=" + product.Ingredients);
            }

            if (product.Allergens.Count > 0)
            {
                details.Add("alerjen=" + string.Join(", ", product.Allergens));
            }

            if (product.Tags.Count > 0)
            {
                details.Add("tag=" + string.Join(", ", product.Tags));
            }

            if (product.Variants.Count > 0)
            {
                details.Add("varyant=" + string.Join(", ", product.Variants));
            }

            return "- " + string.Join(" | ", details);
        });

        return string.Join(Environment.NewLine, lines);
    }

    private static AiAssistantModelResponseDto ParseAssistantResponse(string rawContent)
    {
        var json = ExtractJsonObject(rawContent);
        if (string.IsNullOrWhiteSpace(json))
        {
            return new AiAssistantModelResponseDto { Reply = rawContent.Trim() };
        }

        try
        {
            return JsonSerializer.Deserialize<AiAssistantModelResponseDto>(
                json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new AiAssistantModelResponseDto();
        }
        catch (JsonException)
        {
            return new AiAssistantModelResponseDto { Reply = rawContent.Trim() };
        }
    }

    private static IReadOnlyCollection<AiSuggestedProductDto> ResolveSuggestedProducts(
        AiAssistantModelResponseDto response,
        AiMenuContextDto menuContext)
    {
        var selectedProducts = new List<AiMenuProductContextDto>();

        foreach (var productId in response.SuggestedProductIds)
        {
            if (!Guid.TryParse(productId, out var parsedProductId))
            {
                continue;
            }

            var product = menuContext.Products.FirstOrDefault(item => item.ProductId == parsedProductId);
            if (product is not null && selectedProducts.All(item => item.ProductId != product.ProductId))
            {
                selectedProducts.Add(product);
            }
        }

        foreach (var productName in response.SuggestedProductNames)
        {
            var normalizedName = Normalize(productName);
            var product = menuContext.Products.FirstOrDefault(item => Normalize(item.Name) == normalizedName) ??
                menuContext.Products.FirstOrDefault(item => Normalize(item.Name).Contains(normalizedName));

            if (product is not null && selectedProducts.All(item => item.ProductId != product.ProductId))
            {
                selectedProducts.Add(product);
            }
        }

        return selectedProducts
            .Take(SuggestedProductLimit)
            .Select(ToSuggestedProduct)
            .ToList();
    }

    private static IReadOnlyCollection<AiSuggestedProductDto> ApplyQuestionScope(
        string message,
        IReadOnlyCollection<AiSuggestedProductDto> suggestedProducts,
        AiMenuContextDto menuContext)
    {
        var normalized = Normalize(message);
        if (ContainsAny(normalized, "icecek", "mesrubat", "kahve"))
        {
            return suggestedProducts
                .Where(product => menuContext.Products.Any(contextProduct =>
                    contextProduct.ProductId == product.Id && IsDrinkCategory(contextProduct.CategoryName)))
                .ToList();
        }

        if (ContainsAny(normalized, "salata", "caesar"))
        {
            return suggestedProducts
                .Where(product => menuContext.Products.Any(contextProduct =>
                    contextProduct.ProductId == product.Id && ContainsAny(
                        Normalize(contextProduct.Name + " " + contextProduct.CategoryName + " " + string.Join(' ', contextProduct.Tags)),
                        "salata", "caesar")))
                .ToList();
        }

        if (ContainsAny(normalized, "yemek", "yiyecek", "doyurucu"))
        {
            return suggestedProducts
                .Where(product => menuContext.Products.Any(contextProduct =>
                    contextProduct.ProductId == product.Id && !IsDrinkCategory(contextProduct.CategoryName)))
                .ToList();
        }

        return suggestedProducts;
    }

    private static IReadOnlyCollection<AiSuggestedProductDto> MergeSuggestions(
        IReadOnlyCollection<AiSuggestedProductDto> primaryProducts,
        IReadOnlyCollection<AiSuggestedProductDto> secondaryProducts)
    {
        return primaryProducts
            .Concat(secondaryProducts)
            .GroupBy(product => product.Id)
            .Select(group => group.First())
            .Take(SuggestedProductLimit)
            .ToList();
    }

    private static IReadOnlyCollection<AiSuggestedProductDto> FindRelevantProducts(string message, AiMenuContextDto menuContext)
    {
        var tokens = Normalize(message)
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(token => token.Length > 2)
            .ToList();

        var products = menuContext.Products
            .Select(product => new
            {
                Product = product,
                Score = tokens.Count(token => Normalize(
                    product.Name + " " +
                    product.CategoryName + " " +
                    product.Description + " " +
                    product.Ingredients + " " +
                    string.Join(' ', product.Tags)).Contains(token))
            })
            .Where(item => item.Score > 0)
            .OrderByDescending(item => item.Score)
            .ThenBy(item => item.Product.Name)
            .Select(item => item.Product)
            .Take(SuggestedProductLimit)
            .ToList();

        if (products.Count == 0 && ContainsAny(Normalize(message), "icecek", "mesrubat", "kahve"))
        {
            products = menuContext.Products
                .Where(product => IsDrinkCategory(product.CategoryName))
                .Take(SuggestedProductLimit)
                .ToList();
        }

        if (products.Count == 0 && ContainsAny(Normalize(message), "yemek", "yiyecek", "doyurucu"))
        {
            products = menuContext.Products
                .Where(product => !IsDrinkCategory(product.CategoryName))
                .Take(SuggestedProductLimit)
                .ToList();
        }

        if (products.Count == 0 && ContainsAny(Normalize(message), "yemek", "yiyecek", "ne var", "oner", "doyurucu", "hafif"))
        {
            products = menuContext.Products.Take(SuggestedProductLimit).ToList();
        }

        return products.Select(ToSuggestedProduct).ToList();
    }

    private static bool IsProductDetailQuestion(string normalizedMessage)
    {
        return ContainsAny(normalizedMessage, "doyurucu", "hafif", "aci", "icinde", "icerik", "fiyat", "ucret", "alerjen");
    }

    private static string BuildProductDetailReply(string normalizedMessage, AiSuggestedProductDto product)
    {
        if (ContainsAny(normalizedMessage, "fiyat", "ucret"))
        {
            return product.Name + " fiyatı " + product.Price + " TL.";
        }

        if (ContainsAny(normalizedMessage, "doyurucu"))
        {
            return product.Name + ", açıklamasına göre öğün olarak değerlendirilebilecek bir seçenek. Detayını ürün kartından inceleyip isterseniz sepete ekleyebilirsiniz.";
        }

        if (ContainsAny(normalizedMessage, "hafif"))
        {
            return product.Name + ", açıklamasına göre hafif bir seçenek olabilir. Daha net karar için ürün açıklamasını ve içeriğini ürün kartından kontrol edebilirsiniz.";
        }

        if (ContainsAny(normalizedMessage, "icinde", "icerik", "alerjen"))
        {
            return product.Name + " için menüdeki açıklama: " + product.Description;
        }

        return product.Name + " için menüdeki bilgi: " + product.Description;
    }

    private static string BuildFallbackReply(
        string message,
        AiMenuContextDto menuContext,
        IReadOnlyCollection<AiSuggestedProductDto> suggestedProducts)
    {
        var normalized = Normalize(message);

        if (IsCartGuidanceRequest(normalized))
        {
            return suggestedProducts.Count > 0
                ? "Tabii, bu ürünleri menüden seçip sepete manuel olarak ekleyebilirsiniz. Siparişi tamamlamak için sepeti kullanmanız gerekiyor."
                : "Sipariş vermek için ürünü menüden seçip sepete manuel olarak eklemeniz gerekiyor.";
        }

        if (suggestedProducts.Count > 0)
        {
            var names = string.Join(", ", suggestedProducts.Select(product => product.Name));
            return "Menüde bu isteğe yakın olarak " + names + " uygun görünüyor. Detayları ürün kartlarından inceleyip isterseniz sepete ekleyebilirsiniz.";
        }

        return menuContext.Products.Count > 0
            ? "Menüde aktif ürünler var, ama bu isteğe net bir eşleşme bulamadım. İsterseniz yemek, içecek, hafif veya doyurucu gibi biraz daha net tarif edebilirsiniz."
            : "Bu restoran için aktif menü ürünü görünmüyor.";
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

    private static bool ContainsAny(string value, params string[] needles)
    {
        return needles.Any(value.Contains);
    }

    private static bool IsDrinkCategory(string categoryName)
    {
        return ContainsAny(Normalize(categoryName), "icecek", "kahve", "mesrubat");
    }

    private static bool IsCartGuidanceRequest(string normalizedMessage)
    {
        return ContainsAny(normalizedMessage, "siparis", "sepete", "adet") ||
            normalizedMessage.Any(char.IsDigit);
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

    private static string ExtractJsonObject(string rawContent)
    {
        var start = rawContent.IndexOf('{');
        var end = rawContent.LastIndexOf('}');
        return start >= 0 && end > start ? rawContent[start..(end + 1)] : string.Empty;
    }

    private sealed class OllamaGenerateRequest
    {
        public string Model { get; set; } = string.Empty;
        public string Prompt { get; set; } = string.Empty;
        public bool Stream { get; set; }
    }

    private sealed class OllamaGenerateResponse
    {
        public string Response { get; set; } = string.Empty;
    }
}
