using System.Net.Http.Json;
using AiMenu.Api.DTOs;
using AiMenu.Api.Options;
using AiMenu.Api.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace AiMenu.Api.Services;

public class AiWaiterClient : IAiWaiterClient
{
    private static readonly AiWaiterApiResponseDto FallbackResponse = new()
    {
        Reply = "Şu anda yapay zeka garson yanıt veremiyor. Menüyü inceleyerek sipariş verebilirsiniz.",
        Source = "fallback",
        UsedModel = false
    };

    private readonly HttpClient _httpClient;
    private readonly AiWaiterApiOptions _options;
    private readonly ILogger<AiWaiterClient> _logger;

    public AiWaiterClient(
        HttpClient httpClient,
        IOptions<AiWaiterApiOptions> options,
        ILogger<AiWaiterClient> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<AiWaiterApiResponseDto> ChatAsync(
        AiWaiterApiRequestDto request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync(_options.ChatPath, request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "AiWaiterApi basarisiz cevap dondu. StatusCode={StatusCode}",
                    (int)response.StatusCode);
                return FallbackResponse;
            }

            var waiterResponse = await response.Content.ReadFromJsonAsync<AiWaiterApiResponseDto>(cancellationToken);
            if (waiterResponse is null || string.IsNullOrWhiteSpace(waiterResponse.Reply))
            {
                _logger.LogWarning("AiWaiterApi bos veya gecersiz cevap dondu.");
                return FallbackResponse;
            }

            return waiterResponse;
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("AiWaiterApi istegi zaman asimina ugradi.");
            return FallbackResponse;
        }
        catch (HttpRequestException exception)
        {
            _logger.LogWarning(exception, "AiWaiterApi servisine ulasilamadi.");
            return FallbackResponse;
        }
    }
}
