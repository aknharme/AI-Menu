using System.Diagnostics;
using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;

namespace AiMenu.Api.Services;

public class AiMessageService(
    IMessageRouterService messageRouterService,
    IMenuContextService menuContextService,
    IMenuGroundingService menuGroundingService,
    IAiTagService aiTagService,
    IAiAssistantService aiAssistantService,
    IAiConversationMemoryService conversationMemoryService,
    ILogger<AiMessageService> logger) : IAiMessageService
{
    private const int ProductLimit = 4;

    public async Task<AiMessageResponseDto?> HandleAsync(AiMessageRequestDto request, CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var queryType = "not_evaluated";
        var suggestedProductCount = 0;
        IReadOnlyCollection<string> extractedTags = Array.Empty<string>();

        var intent = await messageRouterService.DetectIntentAsync(request.Message, cancellationToken);

        if (intent == AiMessageIntent.SmallTalk)
        {
            var smallTalkResponse = new AiMessageResponseDto
            {
                Intent = intent.ToResponseValue(),
                Reply = BuildSmallTalkReply(request.Message),
                SuggestedProducts = Array.Empty<AiSuggestedProductDto>()
            };

            LogAiMessage(request, intent, "small_talk", extractedTags, smallTalkResponse.SuggestedProducts.Count, stopwatch);
            return smallTalkResponse;
        }

        if (intent == AiMessageIntent.OutOfScope)
        {
            var outOfScopeResponse = new AiMessageResponseDto
            {
                Intent = intent.ToResponseValue(),
                Reply = "Ben sadece restoran menusu, urun onerileri ve siparis sureci hakkinda yardimci olabilirim.",
                SuggestedProducts = Array.Empty<AiSuggestedProductDto>()
            };

            LogAiMessage(request, intent, "out_of_scope", extractedTags, outOfScopeResponse.SuggestedProducts.Count, stopwatch);
            return outOfScopeResponse;
        }

        var menuContext = await menuContextService.GetActiveMenuContextAsync(request.RestaurantId, cancellationToken);
        if (menuContext is null)
        {
            LogAiMessage(request, intent, "missing_menu_context", extractedTags, suggestedProductCount, stopwatch);
            return null;
        }

        var grounding = menuGroundingService.Ground(request.Message, menuContext);
        queryType = grounding.QueryType;
        if (grounding.QueryType == "unavailable_category")
        {
            var unavailableCategoryResponse = new AiMessageResponseDto
            {
                Intent = AiMessageIntent.MenuRelated.ToResponseValue(),
                Reply = "Menude alkollu icecek gorunmuyor. Isterseniz mevcut icecek seceneklerinden yardimci olabilirim.",
                SuggestedProducts = Array.Empty<AiSuggestedProductDto>()
            };

            LogAiMessage(request, intent, queryType, extractedTags, unavailableCategoryResponse.SuggestedProducts.Count, stopwatch);
            return unavailableCategoryResponse;
        }

        extractedTags = await TryGenerateTagsAsync(request.Message, cancellationToken);
        var groundedProducts = grounding.SuggestedProducts.Count > 0
            ? grounding.Context.Products.Take(ProductLimit).ToList()
            : new List<AiMenuProductContextDto>();
        var tagMatchedProducts = groundedProducts.Count == 0
            ? FindProductsByTags(extractedTags, menuContext.Products)
            : new List<AiMenuProductContextDto>();
        var authoritativeProducts = groundedProducts.Count > 0 ? groundedProducts : tagMatchedProducts;
        var allowProductSuggestions = authoritativeProducts.Count > 0;

        if (tagMatchedProducts.Count > 0)
        {
            queryType = "tag_recommendation";
        }

        var assistantContext = allowProductSuggestions
            ? BuildScopedContext(menuContext, authoritativeProducts)
            : menuContext;

        var conversationHistory = conversationMemoryService.GetRecentTurns(request.RestaurantId, request.TableId);
        var response = await aiAssistantService.ReplyAsync(
            request.Message,
            assistantContext,
            conversationHistory,
            allowProductSuggestions,
            cancellationToken);

        response.SuggestedProducts = allowProductSuggestions
            ? authoritativeProducts.Select(ToSuggestedProduct).ToList()
            : Array.Empty<AiSuggestedProductDto>();
        response.Reply = BuildGroundedReplyFallback(response.Reply, grounding, allowProductSuggestions);
        suggestedProductCount = response.SuggestedProducts.Count;

        conversationMemoryService.AddTurn(
            request.RestaurantId,
            request.TableId,
            request.Message,
            response.Reply,
            response.SuggestedProducts);

        LogAiMessage(request, intent, queryType, extractedTags, suggestedProductCount, stopwatch);
        return response;
    }

    private async Task<IReadOnlyCollection<string>> TryGenerateTagsAsync(string message, CancellationToken cancellationToken)
    {
        try
        {
            return await aiTagService.GenerateTagsAsync(message, cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "AI tag extraction failed.");
            return Array.Empty<string>();
        }
    }

    private static List<AiMenuProductContextDto> FindProductsByTags(
        IReadOnlyCollection<string> tags,
        IReadOnlyCollection<AiMenuProductContextDto> products)
    {
        var normalizedTags = tags
            .Select(Normalize)
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .Distinct(StringComparer.Ordinal)
            .ToList();
        if (normalizedTags.Count == 0)
        {
            return new List<AiMenuProductContextDto>();
        }

        return products
            .Select(product => new
            {
                Product = product,
                Score = normalizedTags.Count(tag => ProductSearchText(product).Contains(tag))
            })
            .Where(item => item.Score > 0)
            .OrderByDescending(item => item.Score)
            .ThenBy(item => item.Product.Name)
            .Take(ProductLimit)
            .Select(item => item.Product)
            .ToList();
    }

    private static AiMenuContextDto BuildScopedContext(
        AiMenuContextDto menuContext,
        IReadOnlyCollection<AiMenuProductContextDto> products)
    {
        return new AiMenuContextDto
        {
            RestaurantId = menuContext.RestaurantId,
            RestaurantName = menuContext.RestaurantName,
            Products = products
        };
    }

    private void LogAiMessage(
        AiMessageRequestDto request,
        AiMessageIntent intent,
        string queryType,
        IReadOnlyCollection<string> extractedTags,
        int suggestedProductCount,
        Stopwatch stopwatch)
    {
        stopwatch.Stop();
        logger.LogInformation(
            "AI message handled. RestaurantId={RestaurantId} TableId={TableId} Intent={Intent} QueryType={QueryType} Tags={Tags} SuggestedProducts={SuggestedProductCount} MessageLength={MessageLength} ElapsedMs={ElapsedMs}",
            request.RestaurantId,
            request.TableId,
            intent.ToResponseValue(),
            queryType,
            string.Join(",", extractedTags),
            suggestedProductCount,
            request.Message.Length,
            stopwatch.ElapsedMilliseconds);
    }

    private static string BuildSmallTalkReply(string message)
    {
        var normalizedMessage = Normalize(message);

        if (ContainsAny(
                normalizedMessage,
                "tesekkur",
                "tesekkurler",
                "sagol",
                "sag olun",
                "eyvallah"))
        {
            return "Rica ederim. Yardimci olabilecegim baska bir konu olursa buradayim.";
        }

        if (ContainsAny(
                normalizedMessage,
                "gorusuruz",
                "iyi gunler",
                "iyi aksamlar",
                "hosca kal"))
        {
            return "Gorusmek uzere. Afiyet olsun.";
        }

        return "Merhaba! Menumuzle ilgili sorularinizda yardimci olabilirim.";
    }

    private static string BuildGroundedReplyFallback(
        string currentReply,
        AiMenuGroundingDto grounding,
        bool allowProductSuggestions)
    {
        if (!allowProductSuggestions)
        {
            return string.IsNullOrWhiteSpace(currentReply)
                ? "Bunu menude net bir urunle eslestiremedim. Hafif, doyurucu, tatli, icecek veya tavuklu gibi biraz daha tarif ederseniz daha iyi yardimci olabilirim."
                : currentReply;
        }

        if (grounding.SuggestedProducts.Count == 0)
        {
            return currentReply;
        }

        var normalizedReply = currentReply.Trim().ToLowerInvariant();
        if (grounding.QueryType == "menu_question" &&
            (string.IsNullOrWhiteSpace(currentReply) ||
             normalizedReply.Contains("listelenmesini") ||
             normalizedReply.Contains("yardimci olabilirim")))
        {
            var names = string.Join(", ", grounding.SuggestedProducts.Select(product => product.Name));
            return "Menude bu bolumde " + names + " secenekleri var. Urun kartlarindan fiyat ve detaylari inceleyebilirsiniz.";
        }

        return currentReply;
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

    private static string ProductSearchText(AiMenuProductContextDto product)
    {
        return Normalize(string.Join(' ', new[]
        {
            product.Name,
            product.CategoryName,
            product.Description,
            product.Ingredients,
            string.Join(' ', product.Tags)
        }));
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
            .Replace("ı", "i")
            .Replace("ğ", "g")
            .Replace("ü", "u")
            .Replace("ş", "s")
            .Replace("ö", "o")
            .Replace("ç", "c");
    }
}
