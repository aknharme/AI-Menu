using System.Collections.Concurrent;
using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;

namespace AiMenu.Api.Services;

public class InMemoryAiConversationMemoryService : IAiConversationMemoryService
{
    private const int MaxTurnsPerConversation = 6;
    private static readonly TimeSpan ConversationTtl = TimeSpan.FromMinutes(30);
    private readonly ConcurrentDictionary<string, List<AiConversationTurnDto>> conversations = new();

    public IReadOnlyCollection<AiConversationTurnDto> GetRecentTurns(Guid restaurantId, Guid? tableId)
    {
        if (tableId is null)
        {
            return Array.Empty<AiConversationTurnDto>();
        }

        var key = BuildKey(restaurantId, tableId);
        if (!conversations.TryGetValue(key, out var turns))
        {
            return Array.Empty<AiConversationTurnDto>();
        }

        lock (turns)
        {
            RemoveExpiredTurns(turns);
            return turns
                .OrderBy(turn => turn.CreatedAtUtc)
                .TakeLast(MaxTurnsPerConversation)
                .Select(CloneTurn)
                .ToList();
        }
    }

    public void AddTurn(
        Guid restaurantId,
        Guid? tableId,
        string userMessage,
        string assistantReply,
        IReadOnlyCollection<AiSuggestedProductDto> suggestedProducts)
    {
        if (tableId is null || string.IsNullOrWhiteSpace(userMessage))
        {
            return;
        }

        var key = BuildKey(restaurantId, tableId);
        var turns = conversations.GetOrAdd(key, _ => new List<AiConversationTurnDto>());

        lock (turns)
        {
            RemoveExpiredTurns(turns);
            turns.Add(new AiConversationTurnDto
            {
                UserMessage = userMessage.Trim(),
                AssistantReply = assistantReply.Trim(),
                SuggestedProductIds = suggestedProducts.Select(product => product.Id).ToList(),
                CreatedAtUtc = DateTime.UtcNow
            });

            if (turns.Count > MaxTurnsPerConversation)
            {
                turns.RemoveRange(0, turns.Count - MaxTurnsPerConversation);
            }
        }
    }

    private static string BuildKey(Guid restaurantId, Guid? tableId)
    {
        return restaurantId + ":" + tableId;
    }

    private static void RemoveExpiredTurns(List<AiConversationTurnDto> turns)
    {
        var oldestAllowed = DateTime.UtcNow.Subtract(ConversationTtl);
        turns.RemoveAll(turn => turn.CreatedAtUtc < oldestAllowed);
    }

    private static AiConversationTurnDto CloneTurn(AiConversationTurnDto turn)
    {
        return new AiConversationTurnDto
        {
            UserMessage = turn.UserMessage,
            AssistantReply = turn.AssistantReply,
            SuggestedProductIds = turn.SuggestedProductIds.ToList(),
            CreatedAtUtc = turn.CreatedAtUtc
        };
    }
}
