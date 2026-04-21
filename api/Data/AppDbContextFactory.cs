using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AiMenu.Api.Data;

// EF Core migration komutları uygulamayı web server olarak başlatmadan DbContext oluşturabilsin diye kullanılır.
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        // Lokal PostgreSQL varsayılanı; gerçek ortamda runtime connection string Program.cs üzerinden gelir.
        optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=ai_menu;Username=postgres;Password=postgres");

        return new AppDbContext(optionsBuilder.Options);
    }
}
