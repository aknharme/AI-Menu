using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

public interface IAiService
{
    Task<AiChatResponseDto?> ChatAsync(Guid restaurantId, AiChatRequestDto request, CancellationToken cancellationToken = default);
}
