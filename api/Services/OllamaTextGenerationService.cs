using System.Net.Http.Json;
using AiMenu.Api.Options;
using AiMenu.Api.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace AiMenu.Api.Services;

public class OllamaTextGenerationService(HttpClient httpClient, IOptions<OllamaOptions> options) : IAiTextGenerationService
{
    private readonly OllamaOptions ollamaOptions = options.Value;

    public async Task<string> GenerateAsync(string prompt, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(prompt))
        {
            return string.Empty;
        }

        var request = new OllamaGenerateRequest
        {
            Model = ollamaOptions.Model,
            Stream = false,
            Prompt = prompt
        };

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(TimeSpan.FromSeconds(Math.Max(5, ollamaOptions.TimeoutSeconds)));

        var response = await httpClient.PostAsJsonAsync("/api/generate", request, timeoutCts.Token);
        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<OllamaGenerateResponse>(cancellationToken: timeoutCts.Token);
        return payload?.Response ?? string.Empty;
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
