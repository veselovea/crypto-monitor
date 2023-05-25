namespace crypto_monitor_finder.dbEntities;

public partial class Plat
{
    public int PlatNum { get; set; }

    public int ChipCount { get; set; }

    public decimal Rate { get; set; }

    public decimal? RateIdeal { get; set; }

    public PlatTemp[] PlatTemps { get; set; }
}
