namespace crypto_monitor_finder.dbEntities;

public partial class Pool
{
    public int PoolNum { get; set; }

    public string Url { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string WorkerName { get; set; } = null!;
}
