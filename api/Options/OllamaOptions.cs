namespace AiMenu.Api.Options;

// OllamaOptions, yerel yapay zeka servisi baglanti ve model ayarlarini tasir.
public class OllamaOptions
{
    public string BaseUrl { get; set; } = "http://localhost:11434";
    public string Model { get; set; } = "llama3";
}
