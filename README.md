# APEX MOTORS - 3D Virtual Hypercar Showroom & Dealership

A cutting-edge, ultra-luxury 3D interactive supercar dealership web platform engineered with **Angular (Three.js WebGL)** and **ASP.NET Core (.NET 10)**.

Designed for tier-1 exotic marques: **Ferrari**, **Lamborghini**, **Bugatti**, **Pagani**, **Porsche**, and **Dodge Demon**.

---

## 🌟 Key Features

### 🏎️ 1. Interactive 3D Supercar Showroom (Three.js & WebGL)
- **High-Fidelity 3D Vehicle Rendering**:
  - Photorealistic Physically Based Rendering (PBR) materials with clearcoat lacquer, metallic flake reflections, carbon fiber weaves, and forged alloy finishes.
  - Realistic studio lighting with HDR reflections, dynamic soft shadows, floor spotlights, and ambient glow.
- **Cockpit Interior Zoom Experience**:
  - Seamless animated camera transition moving from exterior 360° orbit view directly into the driver's cockpit seat.
  - Explore the steering wheel, digital telemetry instrument cluster, leather stitching, and carbon fiber center console.
- **Interactive 3D Hotspots**:
  - Clickable pins on the vehicle highlighting:
    - **Engine Bay**: Powertrain specs, Twin-Turbo/Supercharged/V12 stats.
    - **Cockpit**: F1-style controls, Head-Up Display (HUD), Alcantara appointments.
    - **Active Aerodynamics**: DRS wings, front diffusers, downforce metrics.
    - **Carbon-Ceramic Brakes**: Brembo/PCCB rotor specs and calipers.
- **Bespoke 3D Color Customizer**:
  - Instant real-time paint changes with dynamic metallic/roughness shader updates (Rosso Corsa, Giallo Auge, French Racing Blue, Acid Green, Stealth Matte Carbon, etc.).
- **Studio & Cyber Lighting Modes**:
  - Toggle between Luxury Daylight Studio and Neon Cyber Night with functioning LED headlight projectors and floor light reflections.
- **Web Audio Engine Acoustics**:
  - Synthetic realistic high-rev engine sound synthesizer directly in browser Web Audio API.

---

### ⚡ 2. High-Performance .NET 10 Web API Backend
- **Cars API**:
  - `GET /api/cars` - Full list of hypercars with horsepower, acceleration, top speed, and 3D configuration data.
  - `GET /api/cars/{id}` - Detailed technical telemetry and specification breakdown.
  - `GET /api/cars/{id}/hotspots` - 3D coordinate pins and descriptions.
  - `GET /api/cars/brands` - Available manufacturers.
- **Inquiries API**:
  - `POST /api/inquiries/test-drive` - Book private VIP test-drive sessions.
  - `POST /api/inquiries/custom-build` - Transmit bespoke 3D customizer builds to the dealership atelier.
- **Showroom Telemetry**:
  - `GET /api/showroom/stats` - Real-time inventory valuation, active viewer counts, and concierge availability.

---

## 📁 Project Structure

```
3D-Website/
├── backend/                  # ASP.NET Core Web API (.NET 10)
│   ├── Controllers/          # RESTful API Controllers
│   ├── Models/               # Hypercar & Inquiry Data Models
│   ├── Services/             # Car Repository & Inventory Logic
│   ├── Program.cs            # CORS & DI Setup
│   └── backend.csproj
│
├── frontend/                 # Modern Angular WebGL Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # 3D Canvas, Customizer HUD, Modals
│   │   │   ├── services/     # API Client & WebGL Three.js Engine
│   │   │   └── models/       # TypeScript Interfaces
│   │   ├── assets/           # Textures & Audio
│   │   └── styles.scss       # Luxury Dark Glassmorphism Styling
│   ├── package.json
│   └── angular.json
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/)
- [Node.js 20+](https://nodejs.org/) & npm
- [Angular CLI](https://angular.dev/) (`npm install -g @angular/cli`)

### 2. Run the Backend API (.NET 10)
```bash
cd backend
dotnet run
```
API endpoints will run at `https://localhost:5001` or `http://localhost:5000`.

### 3. Run the Frontend (Angular)
```bash
cd frontend
npm install
npm start
```
Open your browser at `http://localhost:4200` to interact with the 3D Virtual Showroom.

---

## 👑 Developed for
**Shahid Hussain (shahid08569)** - High-End Luxury Hypercar 3D Web Experience.
