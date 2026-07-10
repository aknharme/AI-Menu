using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

public interface IAiWaiterClient
{
    Task<AiWaiterApiResponseDto> ChatAsync(AiWaiterApiRequestDto request, CancellationToken cancellationToken = default);
}
