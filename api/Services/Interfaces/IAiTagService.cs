namespace AiMenu.Api.Services.Interfaces;

// IAiTagService, kullanici prompt'undan yalnizca tag ureten AI katmanini soyutlar.
public interface IAiTagService
{
    Task<IReadOnlyCollection<string>> GenerateTagsAsync(string prompt, CancellationToken cancellationToken = default);
}
