using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

public interface IMessageRouterService
{
    Task<AiMessageIntent> DetectIntentAsync(string message, CancellationToken cancellationToken = default);
}
