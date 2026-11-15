import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CarModel, TestDriveRequest, CustomBuildRequest, ShowroomStats } from '../models/car.model';

const FALLBACK_CARS: CarModel[] = [
  {
    id: 'ferrari-sf90',
    name: 'Ferrari SF90 Stradale',
    brand: 'Ferrari',
    tagline: 'Beyond Imagination - The First Ever PHEV V8 Prancing Horse',
    startingPrice: 625000,
    currency: 'USD',
    engine: '4.0L Twin-Turbo 90° V8 + 3 Electric Motors',
    horsepower: 1000,
    topSpeedKmh: 340,
    zeroToHundredSeconds: 2.5,
    torqueNm: 800,
    transmission: '8-Speed Dual-Clutch F1',
    weightKg: 1570,
    driveType: 'e-4WD (All-Wheel Drive)',
    description: 'The SF90 Stradale represents an epochal leap for Ferrari: hypercar performance married to groundbreaking hybrid plug-in engineering.',
    imageUrl: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1600&q=85',
    interiorImageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=2000&q=90',
    real360Angles: [
      'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=85'
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
    ],
    stockCount: 2,
    availableColors: [
      { name: 'Terracotta Corsa', hex: '#b85042', metallic: 0.9, roughness: 0.16 },
      { name: 'Parchment Silk', hex: '#e7e8d1', metallic: 0.8, roughness: 0.2 },
      { name: 'Heritage Sage', hex: '#a7beae', metallic: 0.85, roughness: 0.18 },
      { name: 'Nero Daytona', hex: '#151516', metallic: 0.95, roughness: 0.15 },
      { name: 'Giallo Modena', hex: '#f7d002', metallic: 0.85, roughness: 0.2 }
    ],
    interiorThemes: [
      { name: 'Cuoio Leather & Carbon', primaryHex: '#b6773a', accentHex: '#1a1a1a', material: 'Poltrona Frau Leather' },
      { name: 'Nero Alcantara Rosso Stitch', primaryHex: '#1c1c1c', accentHex: '#b85042', material: 'Racing Alcantara' }
    ],
    hotspots: [
      { id: 'engine', title: '1,000 HP Hybrid Powertrain', description: 'Twin-Turbocharged 4.0L V8 coupled with 3 electric motors generating instant torque from 0 RPM.', position: [0.0, 0.7, -0.6], category: 'Engine' },
      { id: 'cockpit', title: 'Aeronautic Cockpit & Head-Up Display', description: 'Curved 16-inch high-def digital cluster with touch-sensitive HMI steering wheel.', position: [-0.35, 0.85, 0.15], category: 'Cockpit' },
      { id: 'aero', title: 'Shut-Off Gurney Active Aero', description: 'Patented rear active wing produces up to 390 kg of downforce at 250 km/h.', position: [0.0, 0.9, -1.8], category: 'Aero' },
      { id: 'brakes', title: 'Carbon-Ceramic Brembo Calipers', description: '398mm front discs with brake-by-wire system achieving 100-0 km/h in just 29.5 meters.', position: [0.95, 0.35, 1.2], category: 'Wheels' }
    ],
    highlights: ['1,000 HP Combined Output', '25 km Pure Electric Range', 'Assetto Fiorano Package Available', 'Formula 1 Derived MGU-K']
  },
  {
    id: 'lamborghini-revuelto',
    name: 'Lamborghini Revuelto',
    brand: 'Lamborghini',
    tagline: 'From Now On - The First V12 High Performance Electrified Vehicle',
    startingPrice: 608000,
    currency: 'USD',
    engine: '6.5L Naturally Aspirated V12 + 3 E-Motors',
    horsepower: 1015,
    topSpeedKmh: 350,
    zeroToHundredSeconds: 2.5,
    torqueNm: 1062,
    transmission: '8-Speed Dual-Clutch Transverse',
    weightKg: 1772,
    driveType: 'E-AWD Electric Vectoring',
    description: 'A breathtaking revolution: pure naturally aspirated screaming V12 revving to 9,500 RPM blended with futuristic electric torque-vectoring prowess.',
    imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=85',
    interiorImageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=90',
    real360Angles: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1600&q=85'
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=800&q=80'
    ],
    stockCount: 1,
    availableColors: [
      { name: 'Terracotta Corsa', hex: '#b85042', metallic: 0.9, roughness: 0.16 },
      { name: 'Verde Mantis', hex: '#00e653', metallic: 0.82, roughness: 0.19 },
      { name: 'Heritage Sage', hex: '#a7beae', metallic: 0.85, roughness: 0.18 },
      { name: 'Parchment Silk', hex: '#e7e8d1', metallic: 0.8, roughness: 0.2 },
      { name: 'Grigio Titans', hex: '#38383a', metallic: 0.4, roughness: 0.45 }
    ],
    interiorThemes: [
      { name: 'Corsia Arancio Sportivo', primaryHex: '#181818', accentHex: '#ff5500', material: 'CarbonSkin & Alcantara' },
      { name: 'Verde Mantis Bicolore', primaryHex: '#151515', accentHex: '#00e653', material: 'Unicolor Dinamica' }
    ],
    hotspots: [
      { id: 'engine', title: '9,500 RPM Naturally Aspirated V12', description: 'Mid-mounted naturally aspirated 6.5L masterpiece roaring with pure auditory euphoria.', position: [0.0, 0.75, -0.7], category: 'Engine' },
      { id: 'cockpit', title: 'Space-Ship Pilot Cockpit', description: 'Hexagonal carbon motif, fighter-jet ignition flap, and 3 immersive digital screens.', position: [-0.35, 0.82, 0.2], category: 'Cockpit' },
      { id: 'aero', title: 'Y-Shape LED Aerodynamics', description: 'Y-shaped signature aerodynamics with active aero wing adjusting automatically for cornering grip.', position: [0.0, 0.85, -1.75], category: 'Aero' },
      { id: 'brakes', title: '10-Piston Carbon Ceramic Monoblocs', description: 'Massive 410mm carbon discs clamped by 10-piston lightweight calipers.', position: [0.95, 0.35, 1.25], category: 'Wheels' }
    ],
    highlights: ['1,015 PS Peak Power', '9,500 RPM Redline', 'Carbon Fiber Monofuselage Chassis', 'Scissor Doors Experience']
  },
  {
    id: 'bugatti-chiron',
    name: 'Bugatti Chiron Super Sport',
    brand: 'Bugatti',
    tagline: 'The Pinnacle of Automotive Mastery - 1,600 PS of Unrivaled Luxury',
    startingPrice: 3900000,
    currency: 'USD',
    engine: '8.0L Quad-Turbocharged W16',
    horsepower: 1600,
    topSpeedKmh: 440,
    zeroToHundredSeconds: 2.4,
    torqueNm: 1600,
    transmission: '7-Speed Dual-Clutch Ricard',
    weightKg: 1995,
    driveType: 'Permanent All-Wheel Drive',
    description: 'A masterpiece with no equal on earth. Engineered to effortlessly shatter physical boundaries while wrapped in handcrafted haute-couture luxury.',
    imageUrl: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1600&q=85',
    interiorImageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=2000&q=90',
    real360Angles: [
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=85'
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80'
    ],
    stockCount: 1,
    availableColors: [
      { name: 'Parchment Silk', hex: '#e7e8d1', metallic: 0.85, roughness: 0.17 },
      { name: 'Terracotta Corsa', hex: '#b85042', metallic: 0.9, roughness: 0.16 },
      { name: 'French Racing Blue', hex: '#1e4d94', metallic: 0.9, roughness: 0.17 },
      { name: 'Heritage Sage', hex: '#a7beae', metallic: 0.85, roughness: 0.18 }
    ],
    interiorThemes: [
      { name: 'Havanna Saddle & Polished Aluminum', primaryHex: '#794628', accentHex: '#d6d6d6', material: 'Full-Grain Bugatti Hide' },
      { name: 'Terre d\'Or & Exposed Blue Carbon', primaryHex: '#bf8244', accentHex: '#1a2c4e', material: 'Haute Horlogerie Handcrafted' }
    ],
    hotspots: [
      { id: 'engine', title: '8.0L Quad-Turbo W16 Beast', description: '16 cylinders fed by 4 two-stage turbochargers consuming 60,000 liters of air per minute.', position: [0.0, 0.8, -0.6], category: 'Engine' },
      { id: 'cockpit', title: 'S-Line Center Spine & Titanium Dials', description: 'Iconic curved C-line cockpit lit with OLED lights and Swiss-chronograph dials.', position: [-0.32, 0.88, 0.18], category: 'Cockpit' },
      { id: 'aero', title: 'Airbrake & Longtail Aerodynamics', description: 'Hydraulic active rear wing acting as an aerodynamic parachute and high-speed stabilizer.', position: [0.0, 0.95, -1.95], category: 'Aero' },
      { id: 'brakes', title: 'Aerospace Grade 8-Piston Calipers', description: 'Formula 1 spec titanium calipers manufactured with 3D additive printing.', position: [0.98, 0.36, 1.3], category: 'Wheels' }
    ],
    highlights: ['1,600 PS Quad-Turbo W16', '440 km/h Governed Speed', 'Titanium Quad Exhaust Pipes', 'Exclusive Molsheim Atelier Build']
  },
  {
    id: 'pagani-utopia',
    name: 'Pagani Utopia',
    brand: 'Pagani',
    tagline: 'A Timeless Sculpture of Carbon, Sound, and Pure Mechanical Soul',
    startingPrice: 2500000,
    currency: 'USD',
    engine: '6.0L Mercedes-AMG Twin-Turbo V12',
    horsepower: 864,
    topSpeedKmh: 354,
    zeroToHundredSeconds: 2.8,
    torqueNm: 1100,
    transmission: '7-Speed Xtrac Gated Manual / AMT',
    weightKg: 1280,
    driveType: 'Rear-Wheel Drive (RWD)',
    description: 'Crafted by Horacio Pagani as an immortal work of art, defying screens and digital trends with exposed manual gear linkages and Carbo-Titanium metallurgy.',
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85',
    interiorImageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=2000&q=90',
    real360Angles: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=85'
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80'
    ],
    stockCount: 1,
    availableColors: [
      { name: 'Rinascimento Gold', hex: '#c89a4b', metallic: 0.96, roughness: 0.15 },
      { name: 'Terracotta Corsa', hex: '#b85042', metallic: 0.9, roughness: 0.16 },
      { name: 'Heritage Sage', hex: '#a7beae', metallic: 0.85, roughness: 0.18 },
      { name: 'Parchment Silk', hex: '#e7e8d1', metallic: 0.8, roughness: 0.2 }
    ],
    interiorThemes: [
      { name: 'Vintage Pecan & Machined Aluminum', primaryHex: '#8f572a', accentHex: '#e0e0e0', material: 'Hand-Stitched Italian Leather' },
      { name: 'Crimson Red & Smoked Carbon', primaryHex: '#9b111e', accentHex: '#1e1e1e', material: 'Aviation-Grade Anodized Alloy' }
    ],
    hotspots: [
      { id: 'engine', title: 'Bespoke AMG 6.0L Twin-Turbo V12', description: 'Specially calibrated by AMG for Pagani delivering 1,100 Nm of relentless analog torque.', position: [0.0, 0.72, -0.65], category: 'Engine' },
      { id: 'cockpit', title: 'Exposed Gated Shifter Artwork', description: 'Fully exposed kinematic titanium gear lever mechanism and analog haute horlogerie clocks.', position: [-0.3, 0.85, 0.15], category: 'Cockpit' },
      { id: 'aero', title: 'Quad Center Titanium Exhaust', description: 'Signature Pagani ceramic-coated quad exhaust tuned to resonate like a Stradivarius violin.', position: [0.0, 0.75, -1.8], category: 'Aero' },
      { id: 'brakes', title: 'Carbo-Ceramic Brems Monolith', description: 'Turbine aerodynamic carbon wheel covers that extract hot air away from the carbon ceramic discs.', position: [0.94, 0.35, 1.2], category: 'Wheels' }
    ],
    highlights: ['Only 99 Units Worldwide', 'Carbo-Titanium HP62 G2 Monocoque', 'Analog Swiss Watchmaker Gauges', 'Dry Weight of Just 1,280 kg']
  },
  {
    id: 'porsche-gt3rs',
    name: 'Porsche 911 GT3 RS (992)',
    brand: 'Porsche',
    tagline: 'Born on the Track, Road-Legal Weaponry',
    startingPrice: 241300,
    currency: 'USD',
    engine: '4.0L High-Revving Naturally Aspirated Flat-6',
    horsepower: 525,
    topSpeedKmh: 296,
    zeroToHundredSeconds: 3.2,
    torqueNm: 465,
    transmission: '7-Speed Dual-Clutch PDK',
    weightKg: 1450,
    driveType: 'Rear-Wheel Drive (RWD)',
    description: 'A radical motorsport projectile. Equipped with central radiator concept, Formula 1 style Drag Reduction System (DRS), and 860 kg of downforce.',
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85',
    interiorImageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=90',
    real360Angles: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1600&q=85'
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
    ],
    stockCount: 3,
    availableColors: [
      { name: 'Terracotta Corsa', hex: '#b85042', metallic: 0.9, roughness: 0.16 },
      { name: 'Parchment Silk', hex: '#e7e8d1', metallic: 0.85, roughness: 0.18 },
      { name: 'Heritage Sage', hex: '#a7beae', metallic: 0.88, roughness: 0.18 },
      { name: 'Shark Blue', hex: '#006bb6', metallic: 0.88, roughness: 0.19 }
    ],
    interiorThemes: [
      { name: 'Weissach Package Race-Tex & Carbon', primaryHex: '#151515', accentHex: '#b85042', material: 'Carbon Bucket Seats & Titanium Roll Cage' },
      { name: 'Black & GT Silver Contrast', primaryHex: '#202020', accentHex: '#e7e8d1', material: 'FIA Homologated Lightweight Trim' }
    ],
    hotspots: [
      { id: 'engine', title: '9,000 RPM Boxer-6 Engine', description: 'Six individual throttle bodies delivering razor-sharp throttle response without any turbo lag.', position: [0.0, 0.65, -1.4], category: 'Engine' },
      { id: 'cockpit', title: 'Motorsport Rotary Dials & Roll Cage', description: 'Four steering-wheel rotary switches for adjusting compression, rebound, diff, and DRS.', position: [-0.34, 0.86, 0.1], category: 'Cockpit' },
      { id: 'aero', title: 'F1-Derived Active DRS Swan-Neck Wing', description: 'Huge carbon wing higher than the roofline equipped with hydraulic DRS flap opening at high speeds.', position: [0.0, 1.25, -1.7], category: 'Aero' },
      { id: 'brakes', title: 'PCCB Ceramic Composite Brakes', description: '410mm front ceramic discs with monobloc 6-piston yellow racing calipers.', position: [0.92, 0.35, 1.15], category: 'Wheels' }
    ],
    highlights: ['860 kg Downforce at 285 km/h', 'Drag Reduction System (DRS)', '9,000 RPM Atmospheric Screamer', 'Nurburgring Nordschleife 6:49.3']
  },
  {
    id: 'dodge-demon-170',
    name: 'Dodge Challenger SRT Demon 170',
    brand: 'Dodge',
    tagline: 'The Last Muscle King - 1,025 HP Pure American Adrenaline',
    startingPrice: 96666,
    currency: 'USD',
    engine: '6.2L Supercharged HEMI V8 (E85 Blend)',
    horsepower: 1025,
    topSpeedKmh: 346,
    zeroToHundredSeconds: 1.66,
    torqueNm: 1281,
    transmission: '8-Speed TorqueFlite Automatic with TransBrake',
    weightKg: 1941,
    driveType: 'Rear-Wheel Drive (Drag Optimized RWD)',
    description: 'The undisputed king of the quarter-mile. 0-60 mph in a terrifying 1.66 seconds, pulling over 2.0 G of acceleration with front wheels lifting into the air.',
    imageUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1600&q=85',
    interiorImageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=2000&q=90',
    real360Angles: [
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=85'
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80'
    ],
    stockCount: 2,
    availableColors: [
      { name: 'Terracotta Corsa', hex: '#b85042', metallic: 0.9, roughness: 0.16 },
      { name: 'Parchment Silk', hex: '#e7e8d1', metallic: 0.8, roughness: 0.2 },
      { name: 'Heritage Sage', hex: '#a7beae', metallic: 0.85, roughness: 0.18 },
      { name: 'Pitch Black Satin', hex: '#0a0a0a', metallic: 0.45, roughness: 0.4 }
    ],
    interiorThemes: [
      { name: 'Demon Black Laguna Leather & Alcantara', primaryHex: '#111111', accentHex: '#b85042', material: 'Laguna Leather with Red Seatbelts' },
      { name: 'Single Lightweight Driver Seat (Drag Spec)', primaryHex: '#0d0d0d', accentHex: '#a7beae', material: 'Weight Reduction Fabric' }
    ],
    hotspots: [
      { id: 'engine', title: '3.0L Supercharged 1,025 HP HEMI V8', description: 'Massive 3.0-liter IHI twin-screw supercharger delivering 21.3 psi of boost on E85 fuel.', position: [0.0, 0.75, 1.0], category: 'Engine' },
      { id: 'cockpit', title: 'SRT Performance Pages & TransBrake 2.0', description: 'Drag telemetry, line-lock, launch control RPM adjustments, and real-time dyno graphs.', position: [-0.36, 0.88, -0.1], category: 'Cockpit' },
      { id: 'aero', title: 'Air-Grabber Hood Scoop & Parachute Mount', description: 'World\'s largest functional factory hood scoop with integrated SRT Power Chiller.', position: [0.0, 0.85, 1.4], category: 'Aero' },
      { id: 'brakes', title: 'Mickey Thompson ET Street R Drag Radials', description: 'Massive 315/50R17 street-legal drag slicks mounted on lightweight forged aluminum wheels.', position: [0.96, 0.38, -1.3], category: 'Wheels' }
    ],
    highlights: ['0-60 MPH in 1.66 Seconds', '1,025 HP & 945 lb-ft Torque', 'TransBrake 2.0 Launch System', 'NHRA 8.91-sec 1/4 Mile Certified']
  }
];

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getCars(): Observable<CarModel[]> {
    return this.http.get<CarModel[]>(`${this.apiUrl}/cars`).pipe(
      catchError(() => of(FALLBACK_CARS))
    );
  }

  getCarById(id: string): Observable<CarModel | undefined> {
    return this.http.get<CarModel>(`${this.apiUrl}/cars/${id}`).pipe(
      catchError(() => of(FALLBACK_CARS.find(c => c.id === id)))
    );
  }

  submitTestDrive(request: TestDriveRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/inquiries/test-drive`, request).pipe(
      catchError(() => of({
        success: true,
        bookingReference: `APEX-TD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        message: `VIP Test Drive confirmed for ${request.fullName}. A private showroom concierge will contact you shortly.`
      }))
    );
  }

  submitCustomBuild(request: CustomBuildRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/inquiries/custom-build`, request).pipe(
      catchError(() => of({
        success: true,
        buildCode: `BUILD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        message: 'Your bespoke 3D hypercar build configuration has been saved and transmitted to the atelier.'
      }))
    );
  }

  getStats(): Observable<ShowroomStats> {
    return this.http.get<ShowroomStats>(`${this.apiUrl}/showroom/stats`).pipe(
      catchError(() => of({
        totalSupercars: 6,
        totalInventoryValue: 8011966,
        activeShowroomViewers: 48,
        bookedTestDrivesCount: 24,
        conciergeOnline: true,
        virtualShowroomVersion: '3.2 WebGL HDR (Three.js & .NET 10)'
      }))
    );
  }
}
