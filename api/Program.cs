using AiMenu.Api.Data;
using AiMenu.Api.Constants;
using AiMenu.Api.DTOs;
using AiMenu.Api.Middleware;
using AiMenu.Api.Options;
using AiMenu.Api.Repositories;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services;
using AiMenu.Api.Services.Interfaces;
using AiMenu.Api.Swagger;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

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
        services.Configure<ApiBehaviorOptions>(options =>
        {
            // Model validation hatalari tek formatta frontend'e aktarilir.
            options.InvalidModelStateResponseFactory = context =>
            {
                var details = context.ModelState
                    .Values
                    .SelectMany(value => value.Errors)
                    .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage) ? "Invalid request." : error.ErrorMessage)
                    .Distinct()
                    .ToList();

                return new BadRequestObjectResult(
                    ApiErrorResponseDto.Create(
                        "Istek dogrulama hatasi.",
                        ApiErrorCodes.ValidationError,
                        details));
            };
        });
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SchemaFilter<MenuSchemaExampleFilter>();
            options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = JwtBearerDefaults.AuthenticationScheme,
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "JWT token girin. Ornek: Bearer eyJhbGciOi..."
            });
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = JwtBearerDefaults.AuthenticationScheme
                        }
                    },
                    Array.Empty<string>()
                }
            });
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

        // Ollama ayarlari DI container'a baglanir; AI yine sadece tag uretmekle sinirlidir.
        services.Configure<OllamaOptions>(configuration.GetSection("Ollama"));
        // JWT ayarlari login ve panel erisimleri icin tek noktadan okunur.
        services.Configure<JwtOptions>(configuration.GetSection("Jwt"));
        services.AddHttpClient<IAiTagService, OllamaTagService>((serviceProvider, client) =>
        {
            var ollamaOptions = serviceProvider
                .GetRequiredService<Microsoft.Extensions.Options.IOptions<OllamaOptions>>()
                .Value;

            client.BaseAddress = new Uri(ollamaOptions.BaseUrl.TrimEnd('/') + "/");
            client.Timeout = TimeSpan.FromSeconds(Math.Max(5, ollamaOptions.TimeoutSeconds));
        });
        services.AddHttpClient<IMessageRouterService, MessageRouterService>((serviceProvider, client) =>
        {
            var ollamaOptions = serviceProvider
                .GetRequiredService<Microsoft.Extensions.Options.IOptions<OllamaOptions>>()
                .Value;

            client.BaseAddress = new Uri(ollamaOptions.BaseUrl.TrimEnd('/') + "/");
            client.Timeout = TimeSpan.FromSeconds(Math.Max(5, ollamaOptions.TimeoutSeconds));
        });
        services.AddHttpClient<IAiAssistantService, AiAssistantService>((serviceProvider, client) =>
        {
            var ollamaOptions = serviceProvider
                .GetRequiredService<Microsoft.Extensions.Options.IOptions<OllamaOptions>>()
                .Value;

            client.BaseAddress = new Uri(ollamaOptions.BaseUrl.TrimEnd('/') + "/");
            client.Timeout = TimeSpan.FromSeconds(Math.Max(5, ollamaOptions.TimeoutSeconds));
        });

        var jwtOptions = configuration.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey));

        // JWT middleware admin ve cashier panellerinin bearer token ile korunmasini saglar.
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidAudience = jwtOptions.Audience,
                    IssuerSigningKey = signingKey,
                    ClockSkew = TimeSpan.Zero
                };
            });

        // Rol bazli authorizaton policy'leri controller tarafinda sade authorize attribute'leriyle kullanilir.
        services.AddAuthorization();

        // Katmanli mimaride dependency'ler burada uygulamaya baglanir.
        services.AddHttpContextAccessor();
        services.AddScoped<IRestaurantRepository, RestaurantRepository>();
        services.AddScoped<IAuthRepository, AuthRepository>();
        services.AddScoped<IAdminRepository, AdminRepository>();
        services.AddScoped<ILogRepository, LogRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IRecommendationRepository, RecommendationRepository>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<ILogService, LogService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IAdminStatsService, AdminStatsService>();
        services.AddScoped<IMenuService, MenuService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IRecommendationService, RecommendationService>();
        services.AddScoped<ICashierService, CashierService>();
        services.AddScoped<IMenuContextService, MenuContextService>();
        services.AddScoped<IMenuGroundingService, MenuGroundingService>();
        services.AddScoped<IAiMessageService, AiMessageService>();
    })
    .Configure(app =>
    {
        app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
        app.UseStatusCodePages(async statusCodeContext =>
        {
            var response = statusCodeContext.HttpContext.Response;
            if (!response.HasStarted && response.ContentLength is null && string.IsNullOrWhiteSpace(response.ContentType))
            {
                response.ContentType = "application/json";
                var errorResponse = response.StatusCode switch
                {
                    StatusCodes.Status401Unauthorized => ApiErrorResponseDto.Create("Bu islem icin giris yapmalisiniz.", ApiErrorCodes.Unauthorized),
                    StatusCodes.Status403Forbidden => ApiErrorResponseDto.Create("Bu islem icin yetkiniz bulunmuyor.", ApiErrorCodes.Forbidden),
                    StatusCodes.Status404NotFound => ApiErrorResponseDto.Create("Istenen kaynak bulunamadi.", ApiErrorCodes.NotFound),
                    _ => ApiErrorResponseDto.Create("Istek tamamlanamadi.", ApiErrorCodes.BadRequest)
                };

                await response.WriteAsJsonAsync(errorResponse);
            }
        });
        app.UseSwagger();
        app.UseSwaggerUI();
        app.UseRouting();
        app.UseCors("AllowAll");
        app.UseAuthentication();
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
