namespace AiMenu.Api.DTOs;

public class AiChatResponseDto
{
    public string Response { get; set; } = string.Empty;
    public string Source { get; set; } = "model";
    public bool UsedModel { get; set; } = true;
}
