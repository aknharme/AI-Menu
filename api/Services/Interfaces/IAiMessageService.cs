using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

public interface IAiMessageService
{
    Task<AiMessageResponseDto?> HandleAsync(AiMessageRequestDto request, CancellationToken cancellationToken = default);
}
