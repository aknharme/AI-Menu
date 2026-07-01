using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;
using AiMenu.Api.Options;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AiMenu.Api.Services;

public class AiService : IAiService
{
    private readonly IRestaurantRepository _restaurantRepository;
    private readonly OllamaOptions _ollamaOptions;
    private readonly HttpClient _httpClient;
    private readonly ILogger<AiService> _logger;

    public AiService(
        IRestaurantRepository restaurantRepository,
        IOptions<OllamaOptions> ollamaOptions,
        HttpClient httpClient,
        ILogger<AiService> logger)
    {
        _restaurantRepository = restaurantRepository;
        _ollamaOptions = ollamaOptions.Value;
        _httpClient = httpClient;
        _logger = logger;

        // Base URL configuration for Ollama API
        if (!string.IsNullOrWhiteSpace(_ollamaOptions.BaseUrl))
        {
            _httpClient.BaseAddress = new Uri(_ollamaOptions.BaseUrl.TrimEnd('/') + "/");
        }
    }

    public async Task<AiChatResponseDto?> ChatAsync(
        Guid restaurantId,
        AiChatRequestDto request,
        CancellationToken cancellationToken = default)
    {
        // 1. Restorani kontrol et
        var restaurant = await _restaurantRepository.GetRestaurantAsync(restaurantId, cancellationToken);
        if (restaurant == null)
        {
            _logger.LogWarning("AI Chat: Restoran bulunamadı veya pasif. RestaurantId: {RestaurantId}", restaurantId);
            return null;
        }

        // 2. Veritabanından o restorana ait tüm aktif ürünleri (ad, fiyat, açıklama) çek
        var products = await _restaurantRepository.GetActiveProductsAsync(restaurantId, cancellationToken);
        
        // 3. Ürün listesini temiz bir metin/string haline getir
        var menuText = FormatProductsToMenuText(products);

        // 4. Nihai Prompt/Payload yapısını kur
        var combinedPrompt = BuildSystemPrompt(menuText, request.Message);

        var ollamaRequest = new OllamaGenerateRequest
        {
            Model = _ollamaOptions.Model,
            Prompt = combinedPrompt,
            Stream = false
        };

        try
        {
            var jsonPayload = JsonSerializer.Serialize(ollamaRequest);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            _logger.LogInformation("Ollama API POST isteği gönderiliyor. Model: {Model}, URL: {Url}", 
                _ollamaOptions.Model, _httpClient.BaseAddress + "api/generate");

            var response = await _httpClient.PostAsync("api/generate", content, cancellationToken);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
            var ollamaResponse = JsonSerializer.Deserialize<OllamaGenerateResponse>(responseBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return new AiChatResponseDto
            {
                Response = ollamaResponse?.Response ?? "Maalesef şu an cevap üretemiyorum."
            };
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Ollama API'sine bağlanırken hata oluştu. Lütfen Ollama servisinin localhost üzerinde çalıştığından emin olun.");
            return new AiChatResponseDto
            {
                Response = "Yapay zeka garsonumuz şu an dinleniyor. Lütfen kısa bir süre sonra tekrar deneyiniz."
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Yapay zeka entegrasyonunda beklenmedik hata.");
            return new AiChatResponseDto
            {
                Response = "Sistemde bir hata oluştu, size şu an yardımcı olamıyorum."
            };
        }
    }

    /// <summary>
    /// Veritabanından gelen aktif ürün listesini AI'ın anlayabileceği temiz bir metin haline getirir.
    /// </summary>
    private string FormatProductsToMenuText(IEnumerable<Product> products)
    {
        var sb = new StringBuilder();
        
        foreach (var product in products)
        {
            sb.AppendLine($"- Ürün Adı: {product.Name}");
            sb.AppendLine($"  Fiyat: {product.Price:F2} TL");
            if (!string.IsNullOrWhiteSpace(product.Description))
            {
                sb.AppendLine($"  Açıklama: {product.Description}");
            }
            if (!string.IsNullOrWhiteSpace(product.Ingredients))
            {
                sb.AppendLine($"  İçindekiler: {product.Ingredients}");
            }
            sb.AppendLine();
        }

        return sb.ToString().TrimEnd();
    }

    /// <summary>
    /// Sistem talimatını, güncel menüyü ve kullanıcı sorusunu birleştirerek Ollama için nihai prompt oluşturur.
    /// </summary>
    private string BuildSystemPrompt(string menuText, string customerMessage)
    {
        var sb = new StringBuilder();
        
        sb.AppendLine("[SİSTEM TALİMATI]");
        sb.AppendLine("Sen bu işletmenin profesyonel, kurumsal ve diksiyonu kusursuz Türk garsonusun. Görevin, sana 'GÜNCEL MENÜ' başlığı altında veritabanından dinamik olarak aktarılan ürünler ve açıklamalar doğrultusunda müşteriye cevap vermektir. Kesinlikle halüsinasyon görmemeli, menüde olmayan hiçbir ürün, içerik veya fiyat uydurmamalısın. Müşteriye karşı her zaman kibar, Türkçe dil ve yazım kurallarına %100 uyan net cevaplar üretmelisin.");
        sb.AppendLine();

        sb.AppendLine("[GÜNCEL MENÜ]");
        if (string.IsNullOrWhiteSpace(menuText))
        {
            sb.AppendLine("Şu anda menüde aktif bir ürün bulunmamaktadır.");
        }
        else
        {
            sb.AppendLine(menuText);
        }
        sb.AppendLine();

        sb.AppendLine("[MÜŞTERİ MESAJI]");
        sb.AppendLine(customerMessage);

        return sb.ToString();
    }

    #region Inner Helper Models
    private class OllamaGenerateRequest
    {
        [JsonPropertyName("model")]
        public string Model { get; set; } = "llama3";

        [JsonPropertyName("prompt")]
        public string Prompt { get; set; } = string.Empty;

        [JsonPropertyName("stream")]
        public bool Stream { get; set; } = false;
    }

    private class OllamaGenerateResponse
    {
        [JsonPropertyName("response")]
        public string Response { get; set; } = string.Empty;
    }
    #endregion
}
