namespace crypto_monitor_finder.dbEntities;

public partial class DeviceStatus
{
    public string Ip { get; set; } = null!;

    public int Elapsed { get; set; }

    public double Ghs5s { get; set; }

    public double GhsAvg { get; set; }

    public int Errors { get; set; }

    public Pool[] Pools { get; set; }
    public Cooler[] Coolers { get; set; }
    public Plat[] Plats { get; set; }
}
