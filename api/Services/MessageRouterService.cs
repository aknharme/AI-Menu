using System.Net.Http.Json;
using System.Text.Json;
using AiMenu.Api.DTOs;
using AiMenu.Api.Options;
using AiMenu.Api.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace AiMenu.Api.Services;

public class MessageRouterService(HttpClient httpClient, IOptions<OllamaOptions> options) : IMessageRouterService
{
    private readonly OllamaOptions ollamaOptions = options.Value;

    public async Task<AiMessageIntent> DetectIntentAsync(string message, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            return AiMessageIntent.OutOfScope;
        }

        try
        {
            var request = new OllamaGenerateRequest
            {
                Model = ollamaOptions.Model,
                Stream = false,
                Prompt = BuildClassifierPrompt(message)
            };

            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCts.CancelAfter(TimeSpan.FromSeconds(Math.Max(5, ollamaOptions.TimeoutSeconds)));

            var response = await httpClient.PostAsJsonAsync("/api/generate", request, timeoutCts.Token);
            response.EnsureSuccessStatusCode();

            var payload = await response.Content.ReadFromJsonAsync<OllamaGenerateResponse>(cancellationToken: timeoutCts.Token);
            var classifierResult = ParseClassifierResponse(payload?.Response ?? string.Empty);
            var intent = ParseIntent(classifierResult.Intent);

            if (classifierResult.Confidence >= 0.55)
            {
                return intent;
            }

            var fallbackIntent = DetectIntentWithRules(message);
            return fallbackIntent == AiMessageIntent.OutOfScope ? intent : fallbackIntent;
        }
        catch
        {
            return DetectIntentWithRules(message);
        }
    }

    private static string BuildClassifierPrompt(string message)
    {
        return
            """
            Sen bir mesaj siniflandiricisisin.
            Kullanici mesajini sadece su intentlerden biriyle siniflandir:
            small_talk, menu_related, out_of_scope.

            Kurallar:
            - Selamlasma, tesekkur, nasilsin gibi kisa sosyal mesajlar -> small_talk
            - Restoran, menu, urun, yemek, icecek, fiyat, alerjen, icerik, oneri, urun uyumu, "yaninda ne gider", "doyurucu mu", "aci mi", "hafif mi", "siparis nasil verilir" gibi her sey -> menu_related
            - Kullanici siparis vermek istese bile menu_related sec.
            - Hava durumu, mac sonucu, siyaset, ders, genel sohbet ve restoran disi konular -> out_of_scope
            - Belirsiz ama menuyle ilgili olabilecek mesajlarda menu_related sec.

            Sadece JSON don. Aciklama yazma.
            Format:
            {"intent":"menu_related","confidence":0.92}

            Kullanici mesaji:
            """ + message;
    }

    private static AiIntentClassifierResponseDto ParseClassifierResponse(string rawContent)
    {
        var json = ExtractJsonObject(rawContent);
        if (string.IsNullOrWhiteSpace(json))
        {
            return new AiIntentClassifierResponseDto();
        }

        try
        {
            return JsonSerializer.Deserialize<AiIntentClassifierResponseDto>(
                json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new AiIntentClassifierResponseDto();
        }
        catch (JsonException)
        {
            return new AiIntentClassifierResponseDto();
        }
    }

    private static AiMessageIntent ParseIntent(string intent)
    {
        return intent.Trim().ToLowerInvariant() switch
        {
            "small_talk" => AiMessageIntent.SmallTalk,
            "smalltalk" => AiMessageIntent.SmallTalk,
            "out_of_scope" => AiMessageIntent.OutOfScope,
            "outofscope" => AiMessageIntent.OutOfScope,
            "irrelevant" => AiMessageIntent.OutOfScope,
            _ => AiMessageIntent.MenuRelated
        };
    }

    private static AiMessageIntent DetectIntentWithRules(string message)
    {
        var normalized = Normalize(message);
        var words = normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        if (words.Length <= 4 &&
            ContainsAny(normalized, "merhaba", "selam", "sa", "gunaydin", "iyi aksamlar", "nasilsin", "tesekkur", "tesekkurler"))
        {
            return AiMessageIntent.SmallTalk;
        }

        if (ContainsAny(normalized,
                "menu", "yemek", "yiyecek", "icecek", "urun", "fiyat", "ucret", "alerjen", "icerik",
                "oner", "ne var", "hangi", "tavuk", "burger", "kola", "kahve", "tatli", "doyurucu",
                "hafif", "aci", "yaninda", "siparis", "sepet"))
        {
            return AiMessageIntent.MenuRelated;
        }

        if (ContainsAny(normalized, "hava", "mac", "futbol", "siyaset", "secim", "ders", "odev", "borsa"))
        {
            return AiMessageIntent.OutOfScope;
        }

        return AiMessageIntent.MenuRelated;
    }

    private static bool ContainsAny(string value, params string[] needles)
    {
        return needles.Any(value.Contains);
    }

    private static string Normalize(string value)
    {
        return value
            .Trim()
            .ToLowerInvariant()
            .Replace('ı', 'i')
            .Replace('ğ', 'g')
            .Replace('ü', 'u')
            .Replace('ş', 's')
            .Replace('ö', 'o')
            .Replace('ç', 'c');
    }

    private static string ExtractJsonObject(string rawContent)
    {
        var start = rawContent.IndexOf('{');
        var end = rawContent.LastIndexOf('}');
        return start >= 0 && end > start ? rawContent[start..(end + 1)] : string.Empty;
    }

    private sealed class OllamaGenerateRequest
    {
        public string Model { get; set; } = string.Empty;
        public string Prompt { get; set; } = string.Empty;
        public bool Stream { get; set; }
    }

    private sealed class OllamaGenerateResponse
    {
        public string Response { get; set; } = string.Empty;
    }
}
