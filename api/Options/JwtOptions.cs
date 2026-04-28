namespace AiMenu.Api.Options;

// JwtOptions, token olusturma ve dogrulama ayarlarini tasir.
public class JwtOptions
{
    public string Issuer { get; set; } = "AiMenu";
    public string Audience { get; set; } = "AiMenuClients";
    public string SecretKey { get; set; } = "development-super-secret-key-change-this";
    public int ExpirationMinutes { get; set; } = 120;
}
