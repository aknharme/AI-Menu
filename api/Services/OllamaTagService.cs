using System.Net.Http.Json;
using System.Text.Json;
using AiMenu.Api.Options;
using AiMenu.Api.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace AiMenu.Api.Services;

public class OllamaTagService(HttpClient httpClient, IOptions<OllamaOptions> options) : IAiTagService
{
    private readonly OllamaOptions ollamaOptions = options.Value;

    public async Task<IReadOnlyCollection<string>> GenerateTagsAsync(string prompt, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(prompt))
        {
            return Array.Empty<string>();
        }

        // AI'nin rolu yalnizca kisa ve normalize edilebilir tag listesi uretmekle sinirli tutulur.
        var request = new OllamaGenerateRequest
        {
            Model = ollamaOptions.Model,
            Stream = false,
            Prompt = BuildPrompt(prompt)
        };

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(TimeSpan.FromSeconds(Math.Max(5, ollamaOptions.TimeoutSeconds)));

        var response = await httpClient.PostAsJsonAsync("/api/generate", request, timeoutCts.Token);
        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<OllamaGenerateResponse>(cancellationToken: timeoutCts.Token);
        var rawContent = payload?.Response ?? string.Empty;

        return ExtractTags(rawContent);
    }

    private static string BuildPrompt(string prompt)
    {
        return
            """
            Senin gorevin sadece tag cikarmak.
            Kullanicinin isteginden en fazla 5 adet kisa yemek etiketi uret.
            Cevabi sadece JSON olarak ver.
            Format:
            {"tags":["hafif","tavuk"]}
            Kurallar:
            - Sadece tag uret, urun secme.
            - Tum tag'ler kucuk harf olsun.
            - Aciklama yazma.
            Kullanicinin istegi:
            """ + prompt;
    }

    private static IReadOnlyCollection<string> ExtractTags(string rawContent)
    {
        if (string.IsNullOrWhiteSpace(rawContent))
        {
            return Array.Empty<string>();
        }

        try
        {
            using var document = JsonDocument.Parse(rawContent);
            if (document.RootElement.ValueKind == JsonValueKind.Object &&
                document.RootElement.TryGetProperty("tags", out var tagsElement) &&
                tagsElement.ValueKind == JsonValueKind.Array)
            {
                return TagNormalizer.NormalizeMany(tagsElement.EnumerateArray().Select(item => item.GetString() ?? string.Empty));
            }

            if (document.RootElement.ValueKind == JsonValueKind.Array)
            {
                return TagNormalizer.NormalizeMany(document.RootElement.EnumerateArray().Select(item => item.GetString() ?? string.Empty));
            }
        }
        catch (JsonException)
        {
            // Model saf JSON dondurmezse son care olarak tirnakli degerler icinden tag toplamayi deneriz.
        }

        var extractedTags = rawContent
            .Split(['"', '\n', '\r', ',', '[', ']', '{', '}', ':'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(token => token.All(character => char.IsLetter(character) || character == '-' || character == ' '))
            .Where(token => !string.Equals(token, "tags", StringComparison.OrdinalIgnoreCase));

        return TagNormalizer.NormalizeMany(extractedTags);
    }

    // Ollama request modeli stream kapali tek cevap almak icin yeterli alanlari tasir.
    private sealed class OllamaGenerateRequest
    {
        public string Model { get; set; } = string.Empty;
        public string Prompt { get; set; } = string.Empty;
        public bool Stream { get; set; }
    }

    // Ollama response modeli generate endpoint'inin text cevabini okumak icin kullanilir.
    private sealed class OllamaGenerateResponse
    {
        public string Response { get; set; } = string.Empty;
    }
}
