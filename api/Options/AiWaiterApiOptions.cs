namespace AiMenu.Api.Options;

// AiWaiterApiOptions, AI Menu Backend'in harici AiWaiterApi servisine nasil baglanacagini belirler.
public class AiWaiterApiOptions
{
    public string BaseUrl { get; set; } = "http://localhost:7001";
    public string ChatPath { get; set; } = "/api/waiter/chat";
    public int TimeoutSeconds { get; set; } = 10;
}
