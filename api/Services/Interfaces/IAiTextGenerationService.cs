namespace AiMenu.Api.Services.Interfaces;

public interface IAiTextGenerationService
{
    Task<string> GenerateAsync(string prompt, CancellationToken cancellationToken = default);
}
