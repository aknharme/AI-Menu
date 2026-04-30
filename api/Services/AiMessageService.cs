using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;

namespace AiMenu.Api.Services;

public class AiMessageService(
    IMessageRouterService messageRouterService,
    IMenuContextService menuContextService,
    IMenuGroundingService menuGroundingService,
    IAiAssistantService aiAssistantService) : IAiMessageService
{
    public async Task<AiMessageResponseDto?> HandleAsync(AiMessageRequestDto request, CancellationToken cancellationToken = default)
    {
        var intent = await messageRouterService.DetectIntentAsync(request.Message, cancellationToken);

        if (intent == AiMessageIntent.SmallTalk)
        {
            return new AiMessageResponseDto
            {
                Intent = intent.ToResponseValue(),
                Reply = "Merhaba! Size menümüzden yardımcı olabilirim. Ne tarz bir ürün arıyorsunuz?",
                SuggestedProducts = Array.Empty<AiSuggestedProductDto>()
            };
        }

        if (intent == AiMessageIntent.OutOfScope)
        {
            return new AiMessageResponseDto
            {
                Intent = intent.ToResponseValue(),
                Reply = "Ben sadece restoran menüsü, ürün önerileri ve sipariş süreci hakkında yardımcı olabilirim.",
                SuggestedProducts = Array.Empty<AiSuggestedProductDto>()
            };
        }

        var menuContext = await menuContextService.GetActiveMenuContextAsync(request.RestaurantId, cancellationToken);
        if (menuContext is null)
        {
            return null;
        }

        var grounding = menuGroundingService.Ground(request.Message, menuContext);
        if (grounding.QueryType == "unavailable_category")
        {
            return new AiMessageResponseDto
            {
                Intent = AiMessageIntent.MenuRelated.ToResponseValue(),
                Reply = "Menüde alkollü içecek görünmüyor. İsterseniz mevcut içecek seçeneklerinden yardımcı olabilirim.",
                SuggestedProducts = Array.Empty<AiSuggestedProductDto>()
            };
        }

        var response = await aiAssistantService.ReplyAsync(request.Message, grounding.Context, cancellationToken);
        response.SuggestedProducts = grounding.SuggestedProducts.Count > 0
            ? grounding.SuggestedProducts
            : response.SuggestedProducts;
        response.Reply = BuildGroundedReplyFallback(response.Reply, grounding);

        return response;
    }

    private static string BuildGroundedReplyFallback(string currentReply, AiMenuGroundingDto grounding)
    {
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
            return "Menüde bu bölümde " + names + " seçenekleri var. Ürün kartlarından fiyat ve detayları inceleyebilirsiniz.";
        }

        return currentReply;
    }
}
