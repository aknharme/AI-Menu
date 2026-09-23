namespace AiMenu.Api.Entities;

public class PrintRoute
{
    public Guid CategoryId { get; set; }
    public Guid RestaurantId { get; set; }
    public string Station { get; set; } = "Kitchen";
}

public class PrintPairingCode
{
    public Guid Id { get; set; }
    public Guid RestaurantId { get; set; }
    public string CodeHash { get; set; } = "";
    public DateTimeOffset ExpiresAtUtc { get; set; }
    public DateTimeOffset? ConsumedAtUtc { get; set; }
    public Guid Version { get; set; } = Guid.NewGuid();
}

public class PrintDevice
{
    public Guid Id { get; set; }
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = "";
    public string TokenHash { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public DateTimeOffset? LastSeenAtUtc { get; set; }
}

public class PrintJob
{
    public Guid Id { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid OrderId { get; set; }
    public string Station { get; set; } = "Kitchen";
    public string PayloadJson { get; set; } = "";
    public string State { get; set; } = "Pending";
    public int Attempt { get; set; }
    public Guid? DeviceId { get; set; }
    public Guid? LeaseId { get; set; }
    public DateTimeOffset? LeaseExpiresAtUtc { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? CompletedAtUtc { get; set; }
    public string? Error { get; set; }
    public Guid Version { get; set; } = Guid.NewGuid();
}
