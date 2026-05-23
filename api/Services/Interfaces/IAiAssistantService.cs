using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

public interface IAiAssistantService
{
    Task<AiMessageResponseDto> ReplyAsync(
        string message,
        AiMenuContextDto menuContext,
        IReadOnlyCollection<AiConversationTurnDto> conversationHistory,
        bool allowProductSuggestions,
        CancellationToken cancellationToken = default);
}
