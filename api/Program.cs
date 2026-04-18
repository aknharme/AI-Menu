using AiMenu.Api.Data;
using AiMenu.Api.Repositories;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services;
using AiMenu.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Console log yeterli; Windows EventLog gibi provider'lar lokal ortamda gereksiz izin sorunlari cikarabiliyor.
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// MVC controller endpoint'leri ve Swagger dokumani burada aktive ediliyor.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// MVP asamasinda frontend gelistirmesini bloklamamak icin tum origin'lere izin veriyoruz.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Connection string yoksa proje lokal test icin InMemory ile calisir, varsa PostgreSQL kullanir.
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        options.UseInMemoryDatabase("AiMenuDb");
        return;
    }

    options.UseNpgsql(connectionString);
});

// Katmanli mimaride dependency'ler burada uygulamaya baglanir.
builder.Services.AddScoped<IRestaurantRepository, RestaurantRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IOrderService, OrderService>();

var app = builder.Build();

// Uygulama acilisinda test edilebilir bir temel veri seti olusturuyoruz.
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await AppDbSeeder.SeedAsync(dbContext);
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowAll");
app.UseAuthorization();
// Kök endpoint, servis ayakta mi diye hizli kontrol yapmak icin kullanilir.
app.MapGet("/", () => Results.Ok("API calisiyor"));
app.MapControllers();

app.Run();
