using AiMenu.Api.Data;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Repositories;

public class RestaurantRepository(AppDbContext dbContext) : IRestaurantRepository
{
    public async Task<Restaurant?> GetMenuAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Restaurants
            .AsNoTracking()
            .Include(x => x.Categories.Where(category => category.IsActive))
                .ThenInclude(category => category.Products.Where(product => product.IsActive))
            .FirstOrDefaultAsync(x => x.RestaurantId == restaurantId && x.IsActive, cancellationToken);
    }
}
