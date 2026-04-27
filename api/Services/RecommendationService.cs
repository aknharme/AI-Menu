using System.Net.Http.Json;
using System.Text.Json;
using AiMenu.Api.DTOs;
using AiMenu.Api.Options;
using AiMenu.Api.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace AiMenu.Api.Services;

// RecommendationService, Ollama uzerinden kullanici istegini sadece tag listesine cevirir.
public class RecommendationService(
    HttpClient httpClient,
    IOptions<OllamaOptions> ollamaOptions,
    ILogger<RecommendationService> logger) : IRecommendationService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private static readonly Dictionary<string, string[]> FallbackTagMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["hafif"] = ["hafif"],
        ["light"] = ["hafif"],
        ["doyurucu"] = ["doyurucu"],
        ["tok tutsun"] = ["doyurucu"],
        ["tavuk"] = ["tavuklu"],
        ["tavuklu"] = ["tavuklu"],
        ["et"] = ["etli"],
        ["etli"] = ["etli"],
        ["vegan"] = ["vegan"],
        ["vejetaryen"] = ["vejetaryen"],
        ["aci"] = ["aci"],
        ["acili"] = ["aci"],
        ["spicy"] = ["aci"],
        ["gluten"] = ["glutensiz"],
        ["glutensiz"] = ["glutensiz"],
        ["gluten hassasiyet"] = ["glutensiz"],
        ["sekersiz"] = ["sekersiz"],
        ["seker"] = ["sekersiz"],
        ["sugar free"] = ["sekersiz"],
        ["protein"] = ["protein"],
        ["kahve"] = ["kahve"],
        ["tatli"] = ["tatli"],
        ["dessert"] = ["tatli"],
        ["soguk"] = ["soguk"],
        ["cold"] = ["soguk"],
        ["sicak"] = ["sicak"],
        ["hot"] = ["sicak"],
        ["ferah"] = ["ferah"],
        ["icecek"] = ["icecek"],
        ["burger"] = ["burger"]
    };

    private static readonly Dictionary<string, string> CanonicalTagMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["light"] = "hafif",
        ["refreshing"] = "ferah",
        ["glutenfree"] = "glutensiz",
        ["gluten-free"] = "glutensiz",
        ["chicken"] = "tavuklu",
        ["spicy"] = "aci",
        ["sweet"] = "tatli",
        ["cold"] = "soguk",
        ["hot"] = "sicak",
        ["drink"] = "icecek",
        ["beverage"] = "icecek",
        ["filling"] = "doyurucu",
        ["satisfying"] = "doyurucu"
    };

    public async Task<RecommendationResponseDto> ExtractTagsAsync(
        RecommendationRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var prompt = request.Prompt.Trim();
        if (string.IsNullOrWhiteSpace(prompt))
        {
            return new RecommendationResponseDto();
        }

        try
        {
            using var response = await httpClient.PostAsJsonAsync(
                "api/generate",
                new OllamaGenerateRequest
                {
                    Model = ollamaOptions.Value.Model,
                    Prompt = BuildPrompt(prompt),
                    Stream = false,
                    Format = "json"
                },
                cancellationToken);

            response.EnsureSuccessStatusCode();

            var ollamaResponse = await response.Content.ReadFromJsonAsync<OllamaGenerateResponse>(JsonOptions, cancellationToken);
            var parsedTags = ParseTags(ollamaResponse?.Response);

            if (parsedTags.Count > 0)
            {
                return new RecommendationResponseDto
                {
                    Tags = parsedTags
                };
            }
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "Ollama tag extraction failed. Falling back to deterministic tags.");
        }

        return new RecommendationResponseDto
        {
            Tags = ExtractFallbackTags(prompt)
        };
    }

    private static string BuildPrompt(string userPrompt)
    {
        return
            """
            You are a tag extraction engine for a restaurant QR menu.
            Your job is only to convert the user's text into menu filter tags.

            Rules:
            - Return valid JSON only.
            - Do not return markdown.
            - Do not explain anything.
            - Do not suggest products.
            - Do not invent products.
            - Stay within restaurant menu intent.
            - Output format must be exactly: {"tags":["tag1","tag2"]}.
            - Tags must be short, lowercase, and deduplicated.
            - Prefer Turkish menu tags such as hafif, doyurucu, tavuklu, glutensiz, soguk, sicak, ferah, icecek.
            - If the text is unclear, return {"tags":[]}.

            User text:
            """
            + "\n"
            + userPrompt;
    }

    private static List<string> ParseTags(string? rawResponse)
    {
        if (string.IsNullOrWhiteSpace(rawResponse))
        {
            return [];
        }

        var normalized = ExtractJsonPayload(rawResponse);
        if (string.IsNullOrWhiteSpace(normalized))
        {
            return [];
        }

        try
        {
            using var document = JsonDocument.Parse(normalized);
            if (document.RootElement.ValueKind == JsonValueKind.Object &&
                document.RootElement.TryGetProperty("tags", out var tagsElement) &&
                tagsElement.ValueKind == JsonValueKind.Array)
            {
                return NormalizeTags(tagsElement.EnumerateArray()
                    .Where(x => x.ValueKind == JsonValueKind.String)
                    .Select(x => x.GetString())
                    .OfType<string>());
            }

            if (document.RootElement.ValueKind == JsonValueKind.Array)
            {
                return NormalizeTags(document.RootElement.EnumerateArray()
                    .Where(x => x.ValueKind == JsonValueKind.String)
                    .Select(x => x.GetString())
                    .OfType<string>());
            }
        }
        catch
        {
            return [];
        }

        return [];
    }

    private static string? ExtractJsonPayload(string rawResponse)
    {
        var trimmed = rawResponse.Trim();
        if (trimmed.StartsWith("```", StringComparison.Ordinal))
        {
            trimmed = trimmed.Replace("```json", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("```", string.Empty, StringComparison.Ordinal)
                .Trim();
        }

        var objectStart = trimmed.IndexOf('{');
        var objectEnd = trimmed.LastIndexOf('}');
        if (objectStart >= 0 && objectEnd > objectStart)
        {
            return trimmed[objectStart..(objectEnd + 1)];
        }

        var arrayStart = trimmed.IndexOf('[');
        var arrayEnd = trimmed.LastIndexOf(']');
        if (arrayStart >= 0 && arrayEnd > arrayStart)
        {
            return trimmed[arrayStart..(arrayEnd + 1)];
        }

        return null;
    }

    private static List<string> ExtractFallbackTags(string prompt)
    {
        var lowered = prompt.ToLowerInvariant();
        var tags = new List<string>();

        foreach (var entry in FallbackTagMap)
        {
            if (lowered.Contains(entry.Key.ToLowerInvariant(), StringComparison.Ordinal))
            {
                tags.AddRange(entry.Value);
            }
        }

        return NormalizeTags(tags);
    }

    private static List<string> NormalizeTags(IEnumerable<string> tags)
    {
        return tags
            .Select(tag => tag.Trim().ToLowerInvariant())
            .Select(tag => CanonicalTagMap.TryGetValue(tag, out var canonicalTag) ? canonicalTag : tag)
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .Distinct()
            .ToList();
    }

    private sealed class OllamaGenerateRequest
    {
        public string Model { get; set; } = string.Empty;
        public string Prompt { get; set; } = string.Empty;
        public bool Stream { get; set; }
        public string Format { get; set; } = "json";
    }

    private sealed class OllamaGenerateResponse
    {
        public string? Response { get; set; }
    }
}
