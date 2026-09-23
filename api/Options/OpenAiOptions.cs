namespace AiMenu.Api.Options;

public class OpenAiOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "gpt-4.1-mini";
    public int MaxOutputTokens { get; set; } = 300;
    public int MaxMenuCharacters { get; set; } = 24000;
    public int TimeoutSeconds { get; set; } = 25;
}
