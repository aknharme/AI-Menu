using AiMenu.Api.Entities;

namespace AiMenu.Api.Repositories.Interfaces;

public interface IRestaurantRepository
{
    Task<Restaurant?> GetMenuAsync(Guid restaurantId, CancellationToken cancellationToken = default);
}
