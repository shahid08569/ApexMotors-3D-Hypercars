namespace backend.Models;

public class ColorOption
{
    public string Name { get; set; } = string.Empty;
    public string Hex { get; set; } = string.Empty;
    public double Metallic { get; set; } = 0.85;
    public double Roughness { get; set; } = 0.2;
    public double Clearcoat { get; set; } = 1.0;
}

public class InteriorTheme
{
    public string Name { get; set; } = string.Empty;
    public string PrimaryHex { get; set; } = string.Empty;
    public string AccentHex { get; set; } = string.Empty;
    public string Material { get; set; } = "Alcantara & Carbon Fiber";
}

public class CarHotspot
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double[] Position { get; set; } = Array.Empty<double>(); // [x, y, z]
    public string Category { get; set; } = string.Empty; // Engine, Aero, Wheels, Cockpit
}

public class CarModel
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Tagline { get; set; } = string.Empty;
    public decimal StartingPrice { get; set; }
    public string Currency { get; set; } = "USD";
    public string Engine { get; set; } = string.Empty;
    public int Horsepower { get; set; }
    public int TopSpeedKmh { get; set; }
    public double ZeroToHundredSeconds { get; set; }
    public int TorqueNm { get; set; }
    public string Transmission { get; set; } = string.Empty;
    public int WeightKg { get; set; }
    public string DriveType { get; set; } = "AWD";
    public string Description { get; set; } = string.Empty;
    public int StockCount { get; set; }
    public List<ColorOption> AvailableColors { get; set; } = new();
    public List<InteriorTheme> InteriorThemes { get; set; } = new();
    public List<CarHotspot> Hotspots { get; set; } = new();
    public List<string> Highlights { get; set; } = new();
}

public class TestDriveRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string PreferredDate { get; set; } = string.Empty;
    public string CarId { get; set; } = string.Empty;
    public string DealershipLocation { get; set; } = "Dubai Flagship Showroom";
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class CustomBuildRequest
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CarId { get; set; } = string.Empty;
    public string ColorName { get; set; } = string.Empty;
    public string ColorHex { get; set; } = string.Empty;
    public string InteriorName { get; set; } = string.Empty;
    public string WheelsStyle { get; set; } = "Monoblock Forged Aero";
    public decimal EstimatedTotal { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ShowroomStats
{
    public int TotalSupercars { get; set; }
    public decimal TotalInventoryValue { get; set; }
    public int ActiveShowroomViewers { get; set; }
    public int BookedTestDrivesCount { get; set; }
    public bool ConciergeOnline { get; set; } = true;
    public string VirtualShowroomVersion { get; set; } = "3.2 WebGL HDR";
}
