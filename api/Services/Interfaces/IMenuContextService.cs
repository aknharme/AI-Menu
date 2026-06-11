using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

public interface IMenuContextService
{
    Task<AiMenuContextDto?> GetActiveMenuContextAsync(Guid restaurantId, CancellationToken cancellationToken = default);
}
