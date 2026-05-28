using System.Text.Json;
using AiMenu.Api.Services.Interfaces;

namespace AiMenu.Api.Services;

public class OllamaTagService(IAiTextGenerationService aiTextGenerationService) : IAiTagService
{
    public async Task<IReadOnlyCollection<string>> GenerateTagsAsync(string prompt, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(prompt))
        {
            return Array.Empty<string>();
        }

        var rawContent = await aiTextGenerationService.GenerateAsync(BuildPrompt(prompt), cancellationToken);
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
}
