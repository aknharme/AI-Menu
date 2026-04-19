using AiMenu.Api.Data;
using AiMenu.Api.Repositories;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services;
using AiMenu.Api.Services.Interfaces;
using AiMenu.Api.Swagger;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

var contentRoot = Directory.GetCurrentDirectory();
var apiContentRoot = Path.Combine(contentRoot, "api");
// Komut repo kökünden de api klasörü içinden de çalıştırılsa appsettings.json doğru yerden okunur.
if (!File.Exists(Path.Combine(contentRoot, "appsettings.json")) && File.Exists(Path.Combine(apiContentRoot, "appsettings.json")))
{
    contentRoot = apiContentRoot;
}

var configuration = new ConfigurationBuilder()
    .SetBasePath(contentRoot)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
    .AddEnvironmentVariables()
    .AddCommandLine(args)
    .Build();

var urls = configuration["urls"] ?? Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? "http://localhost:5268";
var connectionString = configuration.GetConnectionString("DefaultConnection");

// Bu ortamda WebApplication.CreateBuilder takıldığı için aynı pipeline klasik WebHostBuilder ile kuruluyor.
var host = new WebHostBuilder()
    .UseKestrel()
    .UseContentRoot(contentRoot)
    .UseConfiguration(configuration)
    .UseUrls(urls)
    .ConfigureLogging(logging =>
    {
        logging.ClearProviders();
        logging.AddConsole();
    })
    .ConfigureServices(services =>
    {
        // MVC controller endpoint'leri ve Swagger dokumani burada aktive ediliyor.
        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SchemaFilter<MenuSchemaExampleFilter>();
        });

        // MVP asamasinda frontend gelistirmesini bloklamamak icin tum origin'lere izin veriyoruz.
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                policy.AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        // Connection string yoksa proje lokal test icin InMemory ile calisir, varsa PostgreSQL kullanir.
        services.AddDbContext<AppDbContext>(options =>
        {
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                options.UseInMemoryDatabase("AiMenuDb");
                return;
            }

            options.UseNpgsql(connectionString);
        });

        // Katmanli mimaride dependency'ler burada uygulamaya baglanir.
        services.AddScoped<IRestaurantRepository, RestaurantRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IMenuService, MenuService>();
        services.AddScoped<IOrderService, OrderService>();
    })
    .Configure(app =>
    {
        app.UseSwagger();
        app.UseSwaggerUI();
        app.UseRouting();
        app.UseCors("AllowAll");
        app.UseAuthorization();
        app.UseEndpoints(endpoints =>
        {
            // Kök endpoint, servis ayakta mi diye hizli kontrol yapmak icin kullanilir.
            endpoints.MapGet("/", async context => await context.Response.WriteAsync("API calisiyor"));
            endpoints.MapControllers();
        });
    })
    .Build();

// Uygulama acilisinda test edilebilir bir temel veri seti olusturuyoruz.
using (var scope = host.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (dbContext.Database.IsRelational())
    {
        // PostgreSQL kullanıldığında şema EF migration'larıyla güncellenir.
        await dbContext.Database.MigrateAsync();
    }
    else
    {
        // Connection string yoksa InMemory DB hızlı lokal test için oluşturulur.
        await dbContext.Database.EnsureCreatedAsync();
    }

    await AppDbSeeder.SeedAsync(dbContext);
}

await host.RunAsync();
