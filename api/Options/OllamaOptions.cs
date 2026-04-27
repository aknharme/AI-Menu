namespace AiMenu.Api.Options;

public class OllamaOptions
{
    public string BaseUrl { get; set; } = "http://localhost:11434";
    public string Model { get; set; } = "qwen2.5:3b";
    public int TimeoutSeconds { get; set; } = 30;
}
