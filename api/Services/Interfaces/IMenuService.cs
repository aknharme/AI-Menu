using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

public interface IMenuService
{
    Task<MenuResponseDto?> GetMenuAsync(Guid restaurantId, CancellationToken cancellationToken = default);
}
