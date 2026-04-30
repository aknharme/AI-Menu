using AiMenu.Api.Entities;

namespace AiMenu.Api.Repositories.Interfaces;

// IAuthRepository, kullanici ve restoran tabanli auth sorgularini toplar.
public interface IAuthRepository
{
    Task<User?> GetUserByEmailAsync(string normalizedEmail, CancellationToken cancellationToken = default);
    Task<User?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> UserEmailExistsAsync(string normalizedEmail, CancellationToken cancellationToken = default);
    Task<Restaurant?> GetRestaurantAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<User> AddUserAsync(User user, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
