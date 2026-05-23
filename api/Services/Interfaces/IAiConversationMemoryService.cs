using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

public interface IAiConversationMemoryService
{
    IReadOnlyCollection<AiConversationTurnDto> GetRecentTurns(Guid restaurantId, Guid? tableId);

    void AddTurn(
        Guid restaurantId,
        Guid? tableId,
        string userMessage,
        string assistantReply,
        IReadOnlyCollection<AiSuggestedProductDto> suggestedProducts);
}
