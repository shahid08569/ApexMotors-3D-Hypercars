import { Injectable, ElementRef, NgZone } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { CarModel, CarHotspot } from '../models/car.model';

export type CameraPreset = 'orbit' | 'cockpit' | 'engine' | 'aero' | 'brakes' | 'front';

@Injectable({
  providedIn: 'root'
})
export class ThreeShowroomService {
  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private animationFrameId!: number;

  // Car groups
  private carRootGroup: THREE.Group = new THREE.Group();
  private carBodyMaterials: THREE.MeshPhysicalMaterial[] = [];
  private carInteriorMaterials: THREE.MeshStandardMaterial[] = [];
  private headlightMeshes: THREE.Mesh[] = [];
  private headlightBeams: THREE.SpotLight[] = [];
  private taillightMeshes: THREE.Mesh[] = [];
  private wheelsGroup: THREE.Group = new THREE.Group();

  // Studio Lighting
  private ambientLight!: THREE.AmbientLight;
  private keySpotLight!: THREE.SpotLight;
  private fillLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
  private ceilingSoftbox!: THREE.Mesh;
  private floorGrid!: THREE.GridHelper;
  private turntableMesh!: THREE.Mesh;

  // State
  private isNightMode: boolean = false;
  private areHeadlightsOn: boolean = true;
  private isInteriorView: boolean = false;
  private currentCar!: CarModel;

  // Hotspot 2D screen positions callback
  public onHotspotsUpdated?: (positions: { id: string; x: number; y: number; visible: boolean }[]) => void;
  private currentHotspots: CarHotspot[] = [];

  constructor(private ngZone: NgZone) {}

  public init(container: ElementRef<HTMLCanvasElement>, car: CarModel): void {
    this.canvas = container.nativeElement;
    this.currentCar = car;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c10);
    this.scene.fog = new THREE.FogExp2(0x0a0c10, 0.04);

    // 2. Camera
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(4.2, 1.8, 4.8);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 4. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below floor
    this.controls.minDistance = 0.5; // Allow zooming into interior
    this.controls.maxDistance = 14;
    this.controls.target.set(0, 0.6, 0);

    // 5. Build Environment & Lighting
    this.setupLighting();
    this.setupShowroomStage();

    // 6. Build 3D Car
    this.scene.add(this.carRootGroup);
    this.buildCarModel(car);

    // 7. Resize listener
    window.addEventListener('resize', this.onWindowResize);

    // 8. Start Loop outside Angular zone for max 60+ FPS performance
    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  private setupLighting(): void {
    // Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    // Key Spotlight from top-front
    this.keySpotLight = new THREE.SpotLight(0xffffff, 2.5);
    this.keySpotLight.position.set(5, 7, 5);
    this.keySpotLight.angle = Math.PI / 4;
    this.keySpotLight.penumbra = 0.7;
    this.keySpotLight.castShadow = true;
    this.keySpotLight.shadow.mapSize.width = 2048;
    this.keySpotLight.shadow.mapSize.height = 2048;
    this.keySpotLight.shadow.bias = -0.0001;
    this.scene.add(this.keySpotLight);

    // Fill Light (cool blueish)
    this.fillLight = new THREE.DirectionalLight(0x90b0e0, 1.2);
    this.fillLight.position.set(-6, 4, -4);
    this.scene.add(this.fillLight);

    // Rim Light (sharp contrast from rear)
    this.rimLight = new THREE.DirectionalLight(0xffeedd, 1.8);
    this.rimLight.position.set(0, 4, -6);
    this.scene.add(this.rimLight);
  }

  private setupShowroomStage(): void {
    // Polished Reflective Stage Platform
    const stageGeo = new THREE.CylinderGeometry(4.8, 5.0, 0.15, 64);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x14171d,
      roughness: 0.15,
      metalness: 0.85
    });
    this.turntableMesh = new THREE.Mesh(stageGeo, stageMat);
    this.turntableMesh.position.y = -0.075;
    this.turntableMesh.receiveShadow = true;
    this.scene.add(this.turntableMesh);

    // Glowing Neon Ring around the turntable
    const ringGeo = new THREE.RingGeometry(4.82, 4.95, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      side: THREE.DoubleSide
    });
    const neonRing = new THREE.Mesh(ringGeo, ringMat);
    neonRing.rotation.x = -Math.PI / 2;
    neonRing.position.y = 0.002;
    this.scene.add(neonRing);

    // Large Softbox Ceiling Light Panel (Visual element)
    const softboxGeo = new THREE.PlaneGeometry(6, 4);
    const softboxMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    });
    this.ceilingSoftbox = new THREE.Mesh(softboxGeo, softboxMat);
    this.ceilingSoftbox.rotation.x = Math.PI / 2;
    this.ceilingSoftbox.position.set(0, 5.2, 0);
    this.scene.add(this.ceilingSoftbox);

    // Floor Grid for cyber ambiance
    this.floorGrid = new THREE.GridHelper(24, 24, 0x00d4ff, 0x182434);
    this.floorGrid.position.y = -0.08;
    this.floorGrid.material.opacity = 0.35;
    this.floorGrid.material.transparent = true;
    this.scene.add(this.floorGrid);
  }

  /**
   * Procedural High-Fidelity 3D Supercar Generator
   * Generates custom body styling based on exotic marque (Ferrari curves, Lambo sharp edges, Bugatti horseshoe & spine, Pagani canopy, Porsche GT3 aero wing, Dodge muscle hood)
   */
  public buildCarModel(car: CarModel): void {
    this.currentCar = car;
    this.currentHotspots = car.hotspots || [];

    // Clear previous car parts
    while (this.carRootGroup.children.length > 0) {
      const child = this.carRootGroup.children[0];
      this.carRootGroup.remove(child);
    }
    this.carBodyMaterials = [];
    this.carInteriorMaterials = [];
    this.headlightMeshes = [];
    this.headlightBeams = [];
    this.taillightMeshes = [];

    const defaultColor = car.availableColors[0] || {
      name: 'Rosso Corsa',
      hex: '#dc0616',
      metallic: 0.9,
      roughness: 0.18
    };

    // Body Paint Material (PBR Clearcoat Lacquer)
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(defaultColor.hex),
      metalness: defaultColor.metallic,
      roughness: defaultColor.roughness,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0
    });
    this.carBodyMaterials.push(bodyMat);

    // Carbon Fiber Material
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x181818,
      metalness: 0.7,
      roughness: 0.3
    });

    // Tinted Glass Material
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a1018,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.75,
      transparent: true,
      opacity: 0.85,
      reflectivity: 0.95
    });

    // Interior Alcantara Material
    const interiorTheme = car.interiorThemes[0] || {
      primaryHex: '#1a1a1a',
      accentHex: '#dc0616'
    };
    const interiorBaseMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(interiorTheme.primaryHex),
      roughness: 0.85,
      metalness: 0.1
    });
    const interiorAccentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(interiorTheme.accentHex),
      roughness: 0.6,
      metalness: 0.2
    });
    this.carInteriorMaterials.push(interiorBaseMat, interiorAccentMat);

    const isLambo = car.id.includes('revuelto') || car.id.includes('lambo');
    const isBugatti = car.id.includes('bugatti');
    const isPagani = car.id.includes('pagani');
    const isPorsche = car.id.includes('porsche');
    const isDodge = car.id.includes('demon') || car.id.includes('dodge');

    /* ====================================================
       1. MAIN LOWER CHASSIS & AERODYNAMIC BODY TUBE
       ==================================================== */
    // Main fuselage
    const mainBodyGeo = new THREE.BoxGeometry(
      isDodge ? 2.05 : 1.95,
      0.45,
      isBugatti ? 4.6 : 4.4
    );
    const mainBody = new THREE.Mesh(mainBodyGeo, bodyMat);
    mainBody.position.set(0, 0.45, 0);
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    this.carRootGroup.add(mainBody);

    // Front Nose / Hood (Sloped aero curve)
    const noseLength = isDodge ? 1.4 : 1.3;
    const noseGeo = new THREE.CylinderGeometry(
      isDodge ? 0.95 : 0.85,
      0.95,
      noseLength,
      isLambo ? 6 : 24
    );
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.rotation.x = Math.PI / 2;
    nose.scale.set(1.1, 0.38, 1.0);
    nose.position.set(0, 0.42, 1.6);
    nose.castShadow = true;
    this.carRootGroup.add(nose);

    // Front Carbon Splitter (Aero ground effect)
    const splitterGeo = new THREE.BoxGeometry(2.0, 0.05, 0.6);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, 0.18, 2.2);
    splitter.castShadow = true;
    this.carRootGroup.add(splitter);

    // Side Skirts (Left & Right Carbon Strakes)
    const skirtGeo = new THREE.BoxGeometry(0.12, 0.06, 2.4);
    const leftSkirt = new THREE.Mesh(skirtGeo, carbonMat);
    leftSkirt.position.set(-1.02, 0.2, 0);
    const rightSkirt = leftSkirt.clone();
    rightSkirt.position.set(1.02, 0.2, 0);
    this.carRootGroup.add(leftSkirt, rightSkirt);

    // Rear Aero Diffuser (Tunnel aerodynamics)
    const diffuserGeo = new THREE.BoxGeometry(1.85, 0.25, 0.45);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonMat);
    diffuser.rotation.x = 0.2;
    diffuser.position.set(0, 0.3, -2.15);
    diffuser.castShadow = true;
    this.carRootGroup.add(diffuser);

    /* ====================================================
       2. COCKPIT GREENHOUSE (WINDSHIELD, ROOF, CANOPY)
       ==================================================== */
    // Roof Dome / Glass Greenhouse
    const cabinWidth = isDodge ? 1.5 : 1.35;
    const cabinLength = isBugatti ? 2.1 : 1.95;
    const cabinGeo = new THREE.BoxGeometry(cabinWidth, 0.52, cabinLength);
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.set(0, 0.88, -0.15);
    cabin.scale.set(1.0, 0.9, 1.0);
    cabin.castShadow = true;
    this.carRootGroup.add(cabin);

    // Windshield (Curved front glass)
    const windshieldGeo = new THREE.PlaneGeometry(1.3, 0.75);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 0.84, 0.72);
    windshield.rotation.x = -Math.PI / 3.4;
    this.carRootGroup.add(windshield);

    // Rear Windshield / Engine Glass Cover
    const rearGlassGeo = new THREE.PlaneGeometry(1.2, 0.9);
    const rearGlass = new THREE.Mesh(rearGlassGeo, glassMat);
    rearGlass.position.set(0, 0.82, -1.05);
    rearGlass.rotation.x = Math.PI / 3.4;
    this.carRootGroup.add(rearGlass);

    // Side Windows
    const sideWinGeo = new THREE.PlaneGeometry(1.3, 0.36);
    const leftWin = new THREE.Mesh(sideWinGeo, glassMat);
    leftWin.rotation.y = Math.PI / 2;
    leftWin.position.set(-0.68, 0.85, -0.1);
    const rightWin = leftWin.clone();
    rightWin.position.x = 0.68;
    rightWin.rotation.y = -Math.PI / 2;
    this.carRootGroup.add(leftWin, rightWin);

    /* ====================================================
       3. INTERIOR COCKPIT (THE ZOOM-IN EXPERIENCE!)
       ==================================================== */
    // Cockpit Floor & Tub
    const tubGeo = new THREE.BoxGeometry(1.28, 0.1, 1.6);
    const tub = new THREE.Mesh(tubGeo, interiorBaseMat);
    tub.position.set(0, 0.32, -0.05);
    this.carRootGroup.add(tub);

    // Dashboard with instrument cluster
    const dashGeo = new THREE.BoxGeometry(1.22, 0.3, 0.45);
    const dash = new THREE.Mesh(dashGeo, interiorBaseMat);
    dash.position.set(0, 0.75, 0.55);
    this.carRootGroup.add(dash);

    // Digital Instrument Cluster Display (HUD screen)
    const screenGeo = new THREE.PlaneGeometry(0.38, 0.16);
    const screenCanvas = this.createDigitalClusterCanvas(car);
    const screenTex = new THREE.CanvasTexture(screenCanvas);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(-0.32, 0.82, 0.42);
    screenMesh.rotation.x = -0.3;
    this.carRootGroup.add(screenMesh);

    // F1 / Sports Flat-Bottom Steering Wheel
    const wheelGroup = new THREE.Group();
    const rimTorus = new THREE.TorusGeometry(0.14, 0.02, 16, 32);
    const steeringMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.5,
      metalness: 0.3
    });
    const steeringRim = new THREE.Mesh(rimTorus, steeringMat);
    wheelGroup.add(steeringRim);

    // Center Horn & Emblem
    const hubGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.x = Math.PI / 2;
    wheelGroup.add(hub);

    // Paddle Shifters
    const paddleGeo = new THREE.BoxGeometry(0.02, 0.08, 0.005);
    const leftPaddle = new THREE.Mesh(paddleGeo, carbonMat);
    leftPaddle.position.set(-0.12, 0.04, -0.02);
    const rightPaddle = leftPaddle.clone();
    rightPaddle.position.x = 0.12;
    wheelGroup.add(leftPaddle, rightPaddle);

    wheelGroup.position.set(-0.32, 0.75, 0.26);
    wheelGroup.rotation.x = -0.35;
    this.carRootGroup.add(wheelGroup);

    // Driver & Passenger Sport Bucket Seats
    const seatGeo = new THREE.BoxGeometry(0.42, 0.68, 0.45);
    const driverSeat = new THREE.Mesh(seatGeo, interiorBaseMat);
    driverSeat.position.set(-0.32, 0.56, -0.22);
    driverSeat.rotation.x = -0.15;

    // Driver seat contrast racing stripe
    const stripeGeo = new THREE.BoxGeometry(0.08, 0.69, 0.46);
    const driverStripe = new THREE.Mesh(stripeGeo, interiorAccentMat);
    driverStripe.position.set(-0.32, 0.56, -0.22);
    driverStripe.rotation.x = -0.15;

    const passSeat = driverSeat.clone();
    passSeat.position.x = 0.32;
    const passStripe = driverStripe.clone();
    passStripe.position.x = 0.32;

    this.carRootGroup.add(driverSeat, driverStripe, passSeat, passStripe);

    // Center Console & Shifter Bridge
    const consoleGeo = new THREE.BoxGeometry(0.2, 0.22, 0.7);
    const centerConsole = new THREE.Mesh(consoleGeo, carbonMat);
    centerConsole.position.set(0, 0.45, 0.05);
    this.carRootGroup.add(centerConsole);

    /* ====================================================
       4. DISTINCTIVE SUPERCAR AERO WINGS & ACCENTS
       ==================================================== */
    if (isPorsche) {
      // Porsche GT3 RS Massive Swan-Neck Active Rear Wing
      const wingGeo = new THREE.BoxGeometry(2.0, 0.04, 0.45);
      const wing = new THREE.Mesh(wingGeo, carbonMat);
      wing.position.set(0, 1.25, -1.9);

      // Swan-neck pylons
      const pylonGeo = new THREE.BoxGeometry(0.04, 0.55, 0.15);
      const pylonL = new THREE.Mesh(pylonGeo, carbonMat);
      pylonL.position.set(-0.55, 1.0, -1.8);
      const pylonR = pylonL.clone();
      pylonR.position.x = 0.55;

      this.carRootGroup.add(wing, pylonL, pylonR);
    } else if (isBugatti) {
      // Bugatti Iconic Horseshoe Grill (Front)
      const horseshoeGeo = new THREE.TorusGeometry(0.22, 0.05, 16, 32, Math.PI);
      const horseMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.95, roughness: 0.1 });
      const horseshoe = new THREE.Mesh(horseshoeGeo, horseMat);
      horseshoe.rotation.x = Math.PI / 2;
      horseshoe.position.set(0, 0.38, 2.22);
      this.carRootGroup.add(horseshoe);

      // Bugatti Retractable Active Longtail Spoiler
      const wingGeo = new THREE.BoxGeometry(1.6, 0.05, 0.4);
      const wing = new THREE.Mesh(wingGeo, carbonMat);
      wing.position.set(0, 0.88, -2.05);
      this.carRootGroup.add(wing);
    } else if (isPagani) {
      // Pagani Teardrop Dual Splitter Wings + Quad Center Exhausts
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.3), carbonMat);
      wingL.position.set(-0.6, 0.88, -1.95);
      const wingR = wingL.clone();
      wingR.position.x = 0.6;
      this.carRootGroup.add(wingL, wingR);
    } else if (isDodge) {
      // Dodge Challenger SRT Demon Air-Grabber Hood Scoop
      const scoopGeo = new THREE.BoxGeometry(0.7, 0.09, 0.6);
      const scoop = new THREE.Mesh(scoopGeo, carbonMat);
      scoop.position.set(0, 0.65, 1.45);
      this.carRootGroup.add(scoop);
    } else {
      // Ferrari / Lambo Active Rear Aero Flap
      const aeroFlap = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.35), carbonMat);
      aeroFlap.position.set(0, 0.82, -1.9);
      this.carRootGroup.add(aeroFlap);
    }

    /* ====================================================
       5. QUAD HEADLIGHTS & NEON TAILLIGHTS
       ==================================================== */
    // Headlights (Left & Right)
    const headMat = new THREE.MeshBasicMaterial({ color: 0xe8f4ff });
    const headGeo = new THREE.BoxGeometry(0.3, 0.08, 0.2);

    const leftHead = new THREE.Mesh(headGeo, headMat);
    leftHead.position.set(-0.75, 0.52, 2.05);
    const rightHead = leftHead.clone();
    rightHead.position.x = 0.75;
    this.carRootGroup.add(leftHead, rightHead);
    this.headlightMeshes.push(leftHead, rightHead);

    // Dynamic Spotlight Beams shooting forward onto floor
    const beamL = new THREE.SpotLight(0xd0e8ff, 4.0, 15, Math.PI / 6, 0.4);
    beamL.position.set(-0.75, 0.52, 2.1);
    beamL.target.position.set(-0.75, 0, 7);
    this.scene.add(beamL.target);
    this.scene.add(beamL);

    const beamR = new THREE.SpotLight(0xd0e8ff, 4.0, 15, Math.PI / 6, 0.4);
    beamR.position.set(0.75, 0.52, 2.1);
    beamR.target.position.set(0.75, 0, 7);
    this.scene.add(beamR.target);
    this.scene.add(beamR);
    this.headlightBeams.push(beamL, beamR);

    // Full-Width Cyber LED Taillight Bar
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0d25 });
    const tailGeo = new THREE.BoxGeometry(1.7, 0.06, 0.08);
    const taillight = new THREE.Mesh(tailGeo, tailMat);
    taillight.position.set(0, 0.65, -2.18);
    this.carRootGroup.add(taillight);
    this.taillightMeshes.push(taillight);

    // Quad Titanium Exhaust Tips
    const tipGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 16);
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0x334455,
      metalness: 0.95,
      roughness: 0.1
    });

    if (isPagani) {
      // Signature Pagani Quad Center Circular Ring
      const paganiExhaustGroup = new THREE.Group();
      const coords = [
        [-0.07, 0.07], [0.07, 0.07],
        [-0.07, -0.07], [0.07, -0.07]
      ];
      coords.forEach(([x, y]) => {
        const pipe = new THREE.Mesh(tipGeo, tipMat);
        pipe.rotation.x = Math.PI / 2;
        pipe.position.set(x, y, 0);
        paganiExhaustGroup.add(pipe);
      });
      paganiExhaustGroup.position.set(0, 0.72, -2.18);
      this.carRootGroup.add(paganiExhaustGroup);
    } else {
      // Classic Quad Dual-Flank Exhausts
      const exhaustOffsets = [-0.65, -0.52, 0.52, 0.65];
      exhaustOffsets.forEach(x => {
        const pipe = new THREE.Mesh(tipGeo, tipMat);
        pipe.rotation.x = Math.PI / 2;
        pipe.position.set(x, 0.38, -2.2);
        this.carRootGroup.add(pipe);
      });
    }

    /* ====================================================
       6. WHEELS, RIMS, BRAKE DISCS & BREMBO CALIPERS
       ==================================================== */
    this.wheelsGroup = new THREE.Group();
    const wheelPositions = [
      [-0.96, 0.34, 1.35],  // Front Left
      [0.96, 0.34, 1.35],   // Front Right
      [-0.98, 0.36, -1.35], // Rear Left
      [0.98, 0.36, -1.35]   // Rear Right
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const singleWheel = this.createPerformanceWheel(x > 0);
      singleWheel.position.set(x, y, z);
      this.wheelsGroup.add(singleWheel);
    });
    this.carRootGroup.add(this.wheelsGroup);
  }

  /**
   * Generates a detailed performance wheel assembly:
   * Low-profile tire, forged alloy rim, slotted carbon-ceramic rotor, and Brembo painted caliper.
   */
  private createPerformanceWheel(isRightSide: boolean): THREE.Group {
    const wheel = new THREE.Group();

    // 1. Rubber Tire
    const tireGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 32);
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.85,
      metalness: 0.1
    });
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheel.add(tire);

    // 2. Forged Alloy Rim with 10 Spokes
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x22262a,
      metalness: 0.95,
      roughness: 0.15
    });
    const rimCenterGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.27, 24);
    const rimCenter = new THREE.Mesh(rimCenterGeo, rimMat);
    rimCenter.rotation.z = Math.PI / 2;
    wheel.add(rimCenter);

    // Spokes
    const spokeGeo = new THREE.BoxGeometry(0.28, 0.02, 0.03);
    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(spokeGeo, rimMat);
      spoke.rotation.x = (i * Math.PI) / 5;
      spoke.position.x = isRightSide ? 0.08 : -0.08;
      wheel.add(spoke);
    }

    // 3. Carbon-Ceramic Drilled Brake Rotor
    const rotorGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.03, 32);
    const rotorMat = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.85,
      roughness: 0.25
    });
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    rotor.rotation.z = Math.PI / 2;
    rotor.position.x = isRightSide ? 0.04 : -0.04;
    wheel.add(rotor);

    // 4. Painted Brembo Racing Caliper (Yellow/Red)
    const caliperGeo = new THREE.BoxGeometry(0.06, 0.12, 0.08);
    const caliperMat = new THREE.MeshStandardMaterial({
      color: 0xffcc00, // Vibrant Racing Yellow
      metalness: 0.7,
      roughness: 0.2
    });
    const caliper = new THREE.Mesh(caliperGeo, caliperMat);
    caliper.position.set(isRightSide ? 0.05 : -0.05, 0.12, 0.0);
    wheel.add(caliper);

    return wheel;
  }

  /**
   * Generates a digital canvas texture representing the supercar instrument cluster
   */
  private createDigitalClusterCanvas(car: CarModel): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#05070a';
      ctx.fillRect(0, 0, 512, 256);

      // Outer cyan border glow
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 492, 236);

      // Speedometer numbers
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 74px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${car.topSpeedKmh}`, 256, 120);

      ctx.fillStyle = '#00d4ff';
      ctx.font = '22px sans-serif';
      ctx.fillText('KM/H  |  GEAR 7  |  RACE MODE', 256, 160);

      // Tachometer bar (Redline)
      ctx.fillStyle = '#ff2200';
      ctx.fillRect(50, 190, 412, 14);

      // Brand tag
      ctx.fillStyle = '#aaaaaa';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(car.name.toUpperCase(), 256, 45);
    }
    return canvas;
  }

  /**
   * Camera Movement Presets with smooth GSAP animations
   */
  public setCameraPreset(preset: CameraPreset): void {
    if (!this.camera || !this.controls) return;

    let targetCamPos = { x: 4.2, y: 1.8, z: 4.8 };
    let targetLookAt = { x: 0, y: 0.6, z: 0 };
    this.isInteriorView = false;

    switch (preset) {
      case 'cockpit':
        // Smoothly glide through the windshield inside the driver seat!
        this.isInteriorView = true;
        targetCamPos = { x: -0.32, y: 0.85, z: 0.05 };
        targetLookAt = { x: -0.32, y: 0.82, z: 1.5 }; // Looking forward through windshield!
        break;

      case 'engine':
        targetCamPos = { x: 0, y: 2.1, z: -2.8 };
        targetLookAt = { x: 0, y: 0.65, z: -0.8 };
        break;

      case 'aero':
        targetCamPos = { x: 1.8, y: 1.4, z: -3.4 };
        targetLookAt = { x: 0, y: 0.7, z: -1.6 };
        break;

      case 'brakes':
        targetCamPos = { x: 2.2, y: 0.5, z: 1.8 };
        targetLookAt = { x: 0.95, y: 0.35, z: 1.35 };
        break;

      case 'front':
        targetCamPos = { x: 0, y: 0.9, z: 4.6 };
        targetLookAt = { x: 0, y: 0.45, z: 1.5 };
        break;

      case 'orbit':
      default:
        targetCamPos = { x: 4.2, y: 1.8, z: 4.8 };
        targetLookAt = { x: 0, y: 0.6, z: 0 };
        break;
    }

    gsap.to(this.camera.position, {
      x: targetCamPos.x,
      y: targetCamPos.y,
      z: targetCamPos.z,
      duration: 1.6,
      ease: 'power3.inOut'
    });

    gsap.to(this.controls.target, {
      x: targetLookAt.x,
      y: targetLookAt.y,
      z: targetLookAt.z,
      duration: 1.6,
      ease: 'power3.inOut'
    });
  }

  /**
   * Update Car Body Paint Color in real time
   */
  public setPaintColor(hex: string, metallic: number = 0.9, roughness: number = 0.18): void {
    const color = new THREE.Color(hex);
    this.carBodyMaterials.forEach(mat => {
      mat.color = color;
      mat.metalness = metallic;
      mat.roughness = roughness;
      mat.needsUpdate = true;
    });
  }

  /**
   * Toggle Headlights & Forward projection beams
   */
  public toggleHeadlights(): boolean {
    this.areHeadlightsOn = !this.areHeadlightsOn;
    this.headlightMeshes.forEach(mesh => {
      (mesh.material as THREE.MeshBasicMaterial).color.set(this.areHeadlightsOn ? 0xe8f4ff : 0x222222);
    });
    this.headlightBeams.forEach(beam => {
      beam.intensity = this.areHeadlightsOn ? (this.isNightMode ? 7.0 : 4.0) : 0;
    });
    return this.areHeadlightsOn;
  }

  /**
   * Toggle Day Studio vs Cyber Night neon showroom
   */
  public toggleShowroomMode(): boolean {
    this.isNightMode = !this.isNightMode;
    if (this.isNightMode) {
      this.scene.background = new THREE.Color(0x020408);
      this.scene.fog = new THREE.FogExp2(0x020408, 0.05);
      this.ambientLight.intensity = 0.15;
      this.keySpotLight.intensity = 1.0;
      this.fillLight.intensity = 0.4;
      this.ceilingSoftbox.visible = false;
      this.floorGrid.material.opacity = 0.6;
    } else {
      this.scene.background = new THREE.Color(0x0a0c10);
      this.scene.fog = new THREE.FogExp2(0x0a0c10, 0.04);
      this.ambientLight.intensity = 0.6;
      this.keySpotLight.intensity = 2.5;
      this.fillLight.intensity = 1.2;
      this.ceilingSoftbox.visible = true;
      this.floorGrid.material.opacity = 0.35;
    }
    return this.isNightMode;
  }

  private onWindowResize = (): void => {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.parentElement?.clientWidth || window.innerWidth;
    const height = this.canvas.parentElement?.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  /**
   * Project 3D Hotspot positions to 2D screen coordinates for overlay badges
   */
  private updateHotspotPositions(): void {
    if (!this.onHotspotsUpdated || !this.currentHotspots.length || !this.camera) return;

    const widthHalf = this.canvas.clientWidth / 2;
    const heightHalf = this.canvas.clientHeight / 2;

    const projected = this.currentHotspots.map(h => {
      const pos = new THREE.Vector3(...h.position);
      // Transform world position with car group
      pos.applyMatrix4(this.carRootGroup.matrixWorld);
      pos.project(this.camera);

      // Check if behind camera
      const visible = pos.z < 1.0 && !this.isInteriorView;

      return {
        id: h.id,
        x: (pos.x * widthHalf) + widthHalf,
        y: -(pos.y * heightHalf) + heightHalf,
        visible
      };
    });

    this.onHotspotsUpdated(projected);
  }

  /**
   * Animation Render Loop
   */
  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Subtle turntable rotation if in normal orbit view
    if (!this.isInteriorView) {
      this.turntableMesh.rotation.y += 0.001;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.updateHotspotPositions();
  };

  public destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer?.dispose();
  }
}
