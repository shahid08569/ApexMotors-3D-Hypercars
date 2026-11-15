using backend.Models;

namespace backend.Services;

public class CarRepository
{
    private readonly List<CarModel> _cars;
    private readonly List<TestDriveRequest> _testDrives = new();
    private readonly List<CustomBuildRequest> _customBuilds = new();

    public CarRepository()
    {
        _cars = new List<CarModel>
        {
            new CarModel
            {
                Id = "ferrari-sf90",
                Name = "Ferrari SF90 Stradale",
                Brand = "Ferrari",
                Tagline = "Beyond Imagination - The First Ever PHEV V8 Prancing Horse",
                StartingPrice = 625000,
                Engine = "4.0L Twin-Turbo 90° V8 + 3 Electric Motors",
                Horsepower = 1000,
                TopSpeedKmh = 340,
                ZeroToHundredSeconds = 2.5,
                TorqueNm = 800,
                Transmission = "8-Speed Dual-Clutch F1",
                WeightKg = 1570,
                DriveType = "e-4WD (All-Wheel Drive)",
                Description = "The SF90 Stradale represents an epochal leap for Ferrari: hypercar performance married to groundbreaking hybrid plug-in engineering.",
                ImageUrl = "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1600&q=85",
                InteriorImageUrl = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=2000&q=90",
                Real360Angles = new()
                {
                    "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1600&q=85", // 0° Front 3/4
                    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=85", // 45° Front Dynamic
                    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85", // 90° Side Profile
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85", // 135° Rear 3/4
                    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85", // 180° Direct Rear
                    "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=85", // 225° Rear Left
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=85", // 270° Side Left
                    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=85"  // 315° Front Left
                },
                GalleryUrls = new()
                {
                    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
                },
                StockCount = 2,
                AvailableColors = new List<ColorOption>
                {
                    new() { Name = "Terracotta Corsa", Hex = "#b85042", Metallic = 0.9, Roughness = 0.16 },
                    new() { Name = "Parchment Silk", Hex = "#e7e8d1", Metallic = 0.8, Roughness = 0.2 },
                    new() { Name = "Heritage Sage", Hex = "#a7beae", Metallic = 0.85, Roughness = 0.18 },
                    new() { Name = "Nero Daytona", Hex = "#151516", Metallic = 0.95, Roughness = 0.15 },
                    new() { Name = "Giallo Modena", Hex = "#f7d002", Metallic = 0.85, Roughness = 0.2 }
                },
                InteriorThemes = new List<InteriorTheme>
                {
                    new() { Name = "Cuoio Leather & Carbon", PrimaryHex = "#b6773a", AccentHex = "#1a1a1a", Material = "Poltrona Frau Leather" },
                    new() { Name = "Nero Alcantara Rosso Stitch", PrimaryHex = "#1c1c1c", AccentHex = "#b85042", Material = "Racing Alcantara" }
                },
                Hotspots = new List<CarHotspot>
                {
                    new() { Id = "engine", Title = "1,000 HP Hybrid Powertrain", Description = "Twin-Turbocharged 4.0L V8 coupled with 3 electric motors generating instant torque from 0 RPM.", Position = new[] { 0.0, 0.7, -0.6 }, Category = "Engine" },
                    new() { Id = "cockpit", Title = "Aeronautic Cockpit & Head-Up Display", Description = "Curved 16-inch high-def digital cluster with touch-sensitive HMI steering wheel.", Position = new[] { -0.35, 0.85, 0.15 }, Category = "Cockpit" },
                    new() { Id = "aero", Title = "Shut-Off Gurney Active Aero", Description = "Patented rear active wing produces up to 390 kg of downforce at 250 km/h.", Position = new[] { 0.0, 0.9, -1.8 }, Category = "Aero" },
                    new() { Id = "brakes", Title = "Carbon-Ceramic Brembo Calipers", Description = "398mm front discs with brake-by-wire system achieving 100-0 km/h in just 29.5 meters.", Position = new[] { 0.95, 0.35, 1.2 }, Category = "Wheels" }
                },
                Highlights = new List<string> { "1,000 HP Combined Output", "25 km Pure Electric Range", "Assetto Fiorano Package Available", "Formula 1 Derived MGU-K" }
            },
            new CarModel
            {
                Id = "lamborghini-revuelto",
                Name = "Lamborghini Revuelto",
                Brand = "Lamborghini",
                Tagline = "From Now On - The First V12 High Performance Electrified Vehicle",
                StartingPrice = 608000,
                Engine = "6.5L Naturally Aspirated V12 + 3 E-Motors",
                Horsepower = 1015,
                TopSpeedKmh = 350,
                ZeroToHundredSeconds = 2.5,
                TorqueNm = 1062,
                Transmission = "8-Speed Dual-Clutch Transverse",
                WeightKg = 1772,
                DriveType = "E-AWD Electric Vectoring",
                Description = "A breathtaking revolution: pure naturally aspirated screaming V12 revving to 9,500 RPM blended with futuristic electric torque-vectoring prowess.",
                ImageUrl = "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=85",
                InteriorImageUrl = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=90",
                Real360Angles = new()
                {
                    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=85", // 0° Front
                    "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1600&q=85", // 45° 3/4 Front
                    "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1600&q=85", // 90° Side Profile
                    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1600&q=85", // 135° Rear 3/4
                    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=85", // 180° Rear
                    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=85", // 225° Rear Left
                    "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=85", // 270° Left Profile
                    "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1600&q=85"  // 315° Front Left
                },
                GalleryUrls = new()
                {
                    "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=800&q=80"
                },
                StockCount = 1,
                AvailableColors = new List<ColorOption>
                {
                    new() { Name = "Terracotta Corsa", Hex = "#b85042", Metallic = 0.9, Roughness = 0.16 },
                    new() { Name = "Verde Mantis", Hex = "#00e653", Metallic = 0.82, Roughness = 0.19 },
                    new() { Name = "Heritage Sage", Hex = "#a7beae", Metallic = 0.85, Roughness = 0.18 },
                    new() { Name = "Parchment Silk", Hex = "#e7e8d1", Metallic = 0.8, Roughness = 0.2 },
                    new() { Name = "Grigio Titans", Hex = "#38383a", Metallic = 0.4, Roughness = 0.45 }
                },
                InteriorThemes = new List<InteriorTheme>
                {
                    new() { Name = "Corsia Arancio Sportivo", PrimaryHex = "#181818", AccentHex = "#ff5500", Material = "CarbonSkin & Alcantara" },
                    new() { Name = "Verde Mantis Bicolore", PrimaryHex = "#151515", AccentHex = "#00e653", Material = "Unicolor Dinamica" }
                },
                Hotspots = new List<CarHotspot>
                {
                    new() { Id = "engine", Title = "9,500 RPM Naturally Aspirated V12", Description = "Mid-mounted naturally aspirated 6.5L masterpiece roaring with pure auditory euphoria.", Position = new[] { 0.0, 0.75, -0.7 }, Category = "Engine" },
                    new() { Id = "cockpit", Title = "Space-Ship Pilot Cockpit", Description = "Hexagonal carbon motif, fighter-jet ignition flap, and 3 immersive digital screens.", Position = new[] { -0.35, 0.82, 0.2 }, Category = "Cockpit" },
                    new() { Id = "aero", Title = "Y-Shape LED Aerodynamics", Description = "Y-shaped signature aerodynamics with active aero wing adjusting automatically for cornering grip.", Position = new[] { 0.0, 0.85, -1.75 }, Category = "Aero" },
                    new() { Id = "brakes", Title = "10-Piston Carbon Ceramic Monoblocs", Description = "Massive 410mm carbon discs clamped by 10-piston lightweight calipers.", Position = new[] { 0.95, 0.35, 1.25 }, Category = "Wheels" }
                },
                Highlights = new List<string> { "1,015 PS Peak Power", "9,500 RPM Redline", "Carbon Fiber Monofuselage Chassis", "Scissor Doors Experience" }
            },
            new CarModel
            {
                Id = "bugatti-chiron",
                Name = "Bugatti Chiron Super Sport",
                Brand = "Bugatti",
                Tagline = "The Pinnacle of Automotive Mastery - 1,600 PS of Unrivaled Luxury",
                StartingPrice = 3900000,
                Engine = "8.0L Quad-Turbocharged W16",
                Horsepower = 1600,
                TopSpeedKmh = 440,
                ZeroToHundredSeconds = 2.4,
                TorqueNm = 1600,
                Transmission = "7-Speed Dual-Clutch Ricard",
                WeightKg = 1995,
                DriveType = "Permanent All-Wheel Drive",
                Description = "A masterpiece with no equal on earth. Engineered to effortlessly shatter physical boundaries while wrapped in handcrafted haute-couture luxury.",
                ImageUrl = "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1600&q=85",
                InteriorImageUrl = "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=2000&q=90",
                Real360Angles = new()
                {
                    "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=85", // 0° Front Horseshoe
                    "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=85", // 45° Front 3/4
                    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85", // 90° C-Line Profile
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85", // 135° Rear Wing
                    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85", // 180° Full Rear Lightbar
                    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=85", // 225° Rear Left
                    "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1600&q=85", // 270° Side Left
                    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=85"  // 315° Front Left
                },
                GalleryUrls = new()
                {
                    "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80"
                },
                StockCount = 1,
                AvailableColors = new List<ColorOption>
                {
                    new() { Name = "Parchment Silk", Hex = "#e7e8d1", Metallic = 0.85, Roughness = 0.17 },
                    new() { Name = "Terracotta Corsa", Hex = "#b85042", Metallic = 0.9, Roughness = 0.16 },
                    new() { Name = "French Racing Blue", Hex = "#1e4d94", Metallic = 0.9, Roughness = 0.17 },
                    new() { Name = "Heritage Sage", Hex = "#a7beae", Metallic = 0.85, Roughness = 0.18 }
                },
                InteriorThemes = new List<InteriorTheme>
                {
                    new() { Name = "Havanna Saddle & Polished Aluminum", PrimaryHex = "#794628", AccentHex = "#d6d6d6", Material = "Full-Grain Bugatti Hide" },
                    new() { Name = "Terre d'Or & Exposed Blue Carbon", PrimaryHex = "#bf8244", AccentHex = "#1a2c4e", Material = "Haute Horlogerie Handcrafted" }
                },
                Hotspots = new List<CarHotspot>
                {
                    new() { Id = "engine", Title = "8.0L Quad-Turbo W16 Beast", Description = "16 cylinders fed by 4 two-stage turbochargers consuming 60,000 liters of air per minute.", Position = new[] { 0.0, 0.8, -0.6 }, Category = "Engine" },
                    new() { Id = "cockpit", Title = "S-Line Center Spine & Titanium Dials", Description = "Iconic curved C-line cockpit lit with OLED lights and Swiss-chronograph dials.", Position = new[] { -0.32, 0.88, 0.18 }, Category = "Cockpit" },
                    new() { Id = "aero", Title = "Airbrake & Longtail Aerodynamics", Description = "Hydraulic active rear wing acting as an aerodynamic parachute and high-speed stabilizer.", Position = new[] { 0.0, 0.95, -1.95 }, Category = "Aero" },
                    new() { Id = "brakes", Title = "Aerospace Grade 8-Piston Calipers", Description = "Formula 1 spec titanium calipers manufactured with 3D additive printing.", Position = new[] { 0.98, 0.36, 1.3 }, Category = "Wheels" }
                },
                Highlights = new List<string> { "1,600 PS Quad-Turbo W16", "440 km/h Governed Speed", "Titanium Quad Exhaust Pipes", "Exclusive Molsheim Atelier Build" }
            },
            new CarModel
            {
                Id = "pagani-utopia",
                Name = "Pagani Utopia",
                Brand = "Pagani",
                Tagline = "A Timeless Sculpture of Carbon, Sound, and Pure Mechanical Soul",
                StartingPrice = 2500000,
                Engine = "6.0L Mercedes-AMG Twin-Turbo V12",
                Horsepower = 864,
                TopSpeedKmh = 354,
                ZeroToHundredSeconds = 2.8,
                TorqueNm = 1100,
                Transmission = "7-Speed Xtrac Gated Manual / AMT",
                WeightKg = 1280,
                DriveType = "Rear-Wheel Drive (RWD)",
                Description = "Crafted by Horacio Pagani as an immortal work of art, defying screens and digital trends with exposed manual gear linkages and Carbo-Titanium metallurgy.",
                ImageUrl = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85",
                InteriorImageUrl = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=2000&q=90",
                Real360Angles = new()
                {
                    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85", // 0° Front Quad
                    "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1600&q=85", // 45° Front 3/4
                    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=85", // 90° Profile Carbon
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85", // 135° Rear Exhaust
                    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85", // 180° Rear Diffuser
                    "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=85", // 225° Rear Left
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=85", // 270° Side Left
                    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=85"  // 315° Front Left
                },
                GalleryUrls = new()
                {
                    "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80"
                },
                StockCount = 1,
                AvailableColors = new List<ColorOption>
                {
                    new() { Name = "Rinascimento Gold", Hex = "#c89a4b", Metallic = 0.96, Roughness = 0.15 },
                    new() { Name = "Terracotta Corsa", Hex = "#b85042", Metallic = 0.9, Roughness = 0.16 },
                    new() { Name = "Heritage Sage", Hex = "#a7beae", Metallic = 0.85, Roughness = 0.18 },
                    new() { Name = "Parchment Silk", Hex = "#e7e8d1", Metallic = 0.8, Roughness = 0.2 }
                },
                InteriorThemes = new List<InteriorTheme>
                {
                    new() { Name = "Vintage Pecan & Machined Aluminum", PrimaryHex = "#8f572a", AccentHex = "#e0e0e0", Material = "Hand-Stitched Italian Leather" },
                    new() { Name = "Crimson Red & Smoked Carbon", PrimaryHex = "#9b111e", AccentHex = "#1e1e1e", Material = "Aviation-Grade Anodized Alloy" }
                },
                Hotspots = new List<CarHotspot>
                {
                    new() { Id = "engine", Title = "Bespoke AMG 6.0L Twin-Turbo V12", Description = "Specially calibrated by AMG for Pagani delivering 1,100 Nm of relentless analog torque.", Position = new[] { 0.0, 0.72, -0.65 }, Category = "Engine" },
                    new() { Id = "cockpit", Title = "Exposed Gated Shifter Artwork", Description = "Fully exposed kinematic titanium gear lever mechanism and analog haute horlogerie clocks.", Position = new[] { -0.3, 0.85, 0.15 }, Category = "Cockpit" },
                    new() { Id = "aero", Title = "Quad Center Titanium Exhaust", Description = "Signature Pagani ceramic-coated quad exhaust tuned to resonate like a Stradivarius violin.", Position = new[] { 0.0, 0.75, -1.8 }, Category = "Aero" },
                    new() { Id = "brakes", Title = "Carbo-Ceramic Brems Monolith", Description = "Turbine aerodynamic carbon wheel covers that extract hot air away from the carbon ceramic discs.", Position = new[] { 0.94, 0.35, 1.2 }, Category = "Wheels" }
                },
                Highlights = new List<string> { "Only 99 Units Worldwide", "Carbo-Titanium HP62 G2 Monocoque", "Analog Swiss Watchmaker Gauges", "Dry Weight of Just 1,280 kg" }
            },
            new CarModel
            {
                Id = "porsche-gt3rs",
                Name = "Porsche 911 GT3 RS (992)",
                Brand = "Porsche",
                Tagline = "Born on the Track, Road-Legal Weaponry",
                StartingPrice = 241300,
                Engine = "4.0L High-Revving Naturally Aspirated Flat-6",
                Horsepower = 525,
                TopSpeedKmh = 296,
                ZeroToHundredSeconds = 3.2,
                TorqueNm = 465,
                Transmission = "7-Speed Dual-Clutch PDK",
                WeightKg = 1450,
                DriveType = "Rear-Wheel Drive (RWD)",
                Description = "A radical motorsport projectile. Equipped with central radiator concept, Formula 1 style Drag Reduction System (DRS), and 860 kg of downforce.",
                ImageUrl = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85",
                InteriorImageUrl = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=90",
                Real360Angles = new()
                {
                    "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85", // 0° Front
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85", // 45° Front 3/4
                    "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1600&q=85", // 90° Profile
                    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1600&q=85", // 135° Giant Wing Rear
                    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85", // 180° Rear Center Duals
                    "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=85", // 225° Rear Left
                    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=85", // 270° Side Left
                    "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1600&q=85"  // 315° Front Left
                },
                GalleryUrls = new()
                {
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
                },
                StockCount = 3,
                AvailableColors = new List<ColorOption>
                {
                    new() { Name = "Terracotta Corsa", Hex = "#b85042", Metallic = 0.9, Roughness = 0.16 },
                    new() { Name = "Parchment Silk", Hex = "#e7e8d1", Metallic = 0.85, Roughness = 0.18 },
                    new() { Name = "Heritage Sage", Hex = "#a7beae", Metallic = 0.88, Roughness = 0.18 },
                    new() { Name = "Shark Blue", Hex = "#006bb6", Metallic = 0.88, Roughness = 0.19 }
                },
                InteriorThemes = new List<InteriorTheme>
                {
                    new() { Name = "Weissach Package Race-Tex & Carbon", PrimaryHex = "#151515", AccentHex = "#b85042", Material = "Carbon Bucket Seats & Titanium Roll Cage" },
                    new() { Name = "Black & GT Silver Contrast", PrimaryHex = "#202020", AccentHex = "#e7e8d1", Material = "FIA Homologated Lightweight Trim" }
                },
                Hotspots = new List<CarHotspot>
                {
                    new() { Id = "engine", Title = "9,000 RPM Boxer-6 Engine", Description = "Six individual throttle bodies delivering razor-sharp throttle response without any turbo lag.", Position = new[] { 0.0, 0.65, -1.4 }, Category = "Engine" },
                    new() { Id = "cockpit", Title = "Motorsport Rotary Dials & Roll Cage", Description = "Four steering-wheel rotary switches for adjusting compression, rebound, diff, and DRS.", Position = new[] { -0.34, 0.86, 0.1 }, Category = "Cockpit" },
                    new() { Id = "aero", Title = "F1-Derived Active DRS Swan-Neck Wing", Description = "Huge carbon wing higher than the roofline equipped with hydraulic DRS flap opening at high speeds.", Position = new[] { 0.0, 1.25, -1.7 }, Category = "Aero" },
                    new() { Id = "brakes", Title = "PCCB Ceramic Composite Brakes", Description = "410mm front ceramic discs with monobloc 6-piston yellow racing calipers.", Position = new[] { 0.92, 0.35, 1.15 }, Category = "Wheels" }
                },
                Highlights = new List<string> { "860 kg Downforce at 285 km/h", "Drag Reduction System (DRS)", "9,000 RPM Atmospheric Screamer", "Nurburgring Nordschleife 6:49.3" }
            },
            new CarModel
            {
                Id = "dodge-demon-170",
                Name = "Dodge Challenger SRT Demon 170",
                Brand = "Dodge",
                Tagline = "The Last Muscle King - 1,025 HP Pure American Adrenaline",
                StartingPrice = 96666,
                Engine = "6.2L Supercharged HEMI V8 (E85 Blend)",
                Horsepower = 1025,
                TopSpeedKmh = 346,
                ZeroToHundredSeconds = 1.66,
                TorqueNm = 1281,
                Transmission = "8-Speed TorqueFlite Automatic with TransBrake",
                WeightKg = 1941,
                DriveType = "Rear-Wheel Drive (Drag Optimized RWD)",
                Description = "The undisputed king of the quarter-mile. 0-60 mph in a terrifying 1.66 seconds, pulling over 2.0 G of acceleration with front wheels lifting into the air.",
                ImageUrl = "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1600&q=85",
                InteriorImageUrl = "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=2000&q=90",
                Real360Angles = new()
                {
                    "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1600&q=85", // 0° Front Scoop
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=85", // 45° Muscle 3/4
                    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=85", // 90° Drag Radial Profile
                    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=85", // 135° Widebody Rear
                    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85", // 180° Demon Spoiler
                    "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=85", // 225° Rear Left
                    "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1600&q=85", // 270° Side Left
                    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=85"  // 315° Front Left
                },
                GalleryUrls = new()
                {
                    "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80"
                },
                StockCount = 2,
                AvailableColors = new List<ColorOption>
                {
                    new() { Name = "Terracotta Corsa", Hex = "#b85042", Metallic = 0.9, Roughness = 0.16 },
                    new() { Name = "Parchment Silk", Hex = "#e7e8d1", Metallic = 0.8, Roughness = 0.2 },
                    new() { Name = "Heritage Sage", Hex = "#a7beae", Metallic = 0.85, Roughness = 0.18 },
                    new() { Name = "Pitch Black Satin", Hex = "#0a0a0a", Metallic = 0.45, Roughness = 0.4 }
                },
                InteriorThemes = new List<InteriorTheme>
                {
                    new() { Name = "Demon Black Laguna Leather & Alcantara", PrimaryHex = "#111111", AccentHex = "#b85042", Material = "Laguna Leather with Red Seatbelts" },
                    new() { Name = "Single Lightweight Driver Seat (Drag Spec)", PrimaryHex = "#0d0d0d", AccentHex = "#a7beae", Material = "Weight Reduction Fabric" }
                },
                Hotspots = new List<CarHotspot>
                {
                    new() { Id = "engine", Title = "3.0L Supercharged 1,025 HP HEMI V8", Description = "Massive 3.0-liter IHI twin-screw supercharger delivering 21.3 psi of boost on E85 fuel.", Position = new[] { 0.0, 0.75, 1.0 }, Category = "Engine" },
                    new() { Id = "cockpit", Title = "SRT Performance Pages & TransBrake 2.0", Description = "Drag telemetry, line-lock, launch control RPM adjustments, and real-time dyno graphs.", Position = new[] { -0.36, 0.88, -0.1 }, Category = "Cockpit" },
                    new() { Id = "aero", Title = "Air-Grabber Hood Scoop & Parachute Mount", Description = "World's largest functional factory hood scoop with integrated SRT Power Chiller.", Position = new[] { 0.0, 0.85, 1.4 }, Category = "Aero" },
                    new() { Id = "brakes", Title = "Mickey Thompson ET Street R Drag Radials", Description = "Massive 315/50R17 street-legal drag slicks mounted on lightweight forged aluminum wheels.", Position = new[] { 0.96, 0.38, -1.3 }, Category = "Wheels" }
                },
                Highlights = new List<string> { "0-60 MPH in 1.66 Seconds", "1,025 HP & 945 lb-ft Torque", "TransBrake 2.0 Launch System", "NHRA 8.91-sec 1/4 Mile Certified" }
            }
        };
    }

    public List<CarModel> GetAllCars() => _cars;

    public CarModel? GetCarById(string id) =>
        _cars.FirstOrDefault(c => c.Id.Equals(id, StringComparison.OrdinalIgnoreCase));

    public List<string> GetBrands() =>
        _cars.Select(c => c.Brand).Distinct().ToList();

    public bool AddTestDrive(TestDriveRequest request)
    {
        _testDrives.Add(request);
        return true;
    }

    public List<TestDriveRequest> GetTestDrives() => _testDrives;

    public bool AddCustomBuild(CustomBuildRequest request)
    {
        _customBuilds.Add(request);
        return true;
    }

    public List<CustomBuildRequest> GetCustomBuilds() => _customBuilds;

    public ShowroomStats GetStats()
    {
        return new ShowroomStats
        {
            TotalSupercars = _cars.Count,
            TotalInventoryValue = _cars.Sum(c => c.StartingPrice),
            ActiveShowroomViewers = 42,
            BookedTestDrivesCount = _testDrives.Count + 18,
            ConciergeOnline = true,
            VirtualShowroomVersion = "3.2 WebGL HDR (Three.js & .NET 10)"
        };
    }
}
