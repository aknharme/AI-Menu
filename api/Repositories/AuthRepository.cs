using AiMenu.Api.Data;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Repositories;

public class AuthRepository(AppDbContext dbContext) : IAuthRepository
{
    public async Task<User?> GetUserByEmailAsync(string normalizedEmail, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users
            .Include(user => user.Restaurant)
            .FirstOrDefaultAsync(user => user.Email == normalizedEmail && user.IsActive, cancellationToken);
    }

    public async Task<User?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users
            .Include(user => user.Restaurant)
            .FirstOrDefaultAsync(user => user.UserId == userId && user.IsActive, cancellationToken);
    }

    public async Task<bool> UserEmailExistsAsync(string normalizedEmail, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users.AnyAsync(user => user.Email == normalizedEmail, cancellationToken);
    }

    public async Task<Restaurant?> GetRestaurantAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Restaurants.FirstOrDefaultAsync(
            restaurant => restaurant.RestaurantId == restaurantId && restaurant.IsActive,
            cancellationToken);
    }

    public async Task<User> AddUserAsync(User user, CancellationToken cancellationToken = default)
    {
        await dbContext.Users.AddAsync(user, cancellationToken);
        return user;
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
