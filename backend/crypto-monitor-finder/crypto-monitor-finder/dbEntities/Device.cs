namespace crypto_monitor_finder.dbEntities;

public partial class Device
{
    public bool IsDevice { get; set; }

    public APIExceptions[] APIExceptions { get; set; }

    public string Mac { get; set; } = null!;

    public string Model { get; set; } = null!;

    public double RateIdeal { get; set; }

    public string RateUnit { get; set; } = null!;

    public string CompileTime { get; set; } = null!;

    public DeviceStatus Status { get; set; }
}
