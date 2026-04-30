namespace AiMenu.Api.DTOs;

// AiTagResponseDto, AI servisinden uretilen normalize edilmis tag listesini disariya acar.
public class AiTagResponseDto
{
    public IReadOnlyCollection<string> Tags { get; set; } = Array.Empty<string>();
}
