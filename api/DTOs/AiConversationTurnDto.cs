namespace AiMenu.Api.DTOs;

public class AiConversationTurnDto
{
    public string UserMessage { get; set; } = string.Empty;
    public string AssistantReply { get; set; } = string.Empty;
    public IReadOnlyCollection<Guid> SuggestedProductIds { get; set; } = Array.Empty<Guid>();
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
