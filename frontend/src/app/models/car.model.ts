export interface ColorOption {
  name: string;
  hex: string;
  metallic: number;
  roughness: number;
  clearcoat?: number;
}

export interface InteriorTheme {
  name: string;
  primaryHex: string;
  accentHex: string;
  material: string;
}

export interface CarHotspot {
  id: string;
  title: string;
  description: string;
  position: [number, number, number];
  category: 'Engine' | 'Cockpit' | 'Aero' | 'Wheels' | string;
}

export interface CarModel {
  id: string;
  name: string;
  brand: string;
  tagline: string;
  startingPrice: number;
  currency: string;
  engine: string;
  horsepower: number;
  topSpeedKmh: number;
  zeroToHundredSeconds: number;
  torqueNm: number;
  transmission: string;
  weightKg: number;
  driveType: string;
  description: string;
  imageUrl?: string;
  interiorImageUrl?: string;
  galleryUrls?: string[];
  stockCount: number;
  availableColors: ColorOption[];
  interiorThemes: InteriorTheme[];
  hotspots: CarHotspot[];
  highlights: string[];
}

export interface TestDriveRequest {
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  carId: string;
  dealershipLocation?: string;
  notes?: string;
}

export interface CustomBuildRequest {
  customerName: string;
  customerEmail: string;
  carId: string;
  colorName: string;
  colorHex: string;
  interiorName: string;
  wheelsStyle: string;
  estimatedTotal: number;
}

export interface ShowroomStats {
  totalSupercars: number;
  totalInventoryValue: number;
  activeShowroomViewers: number;
  bookedTestDrivesCount: number;
  conciergeOnline: boolean;
  virtualShowroomVersion: string;
}
