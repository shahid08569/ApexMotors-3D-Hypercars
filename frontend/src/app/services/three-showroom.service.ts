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
    if (!container || !container.nativeElement) return;
    this.canvas = container.nativeElement;
    this.currentCar = car;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent so luxury architectural showroom background image shines through!

    // 2. Camera
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || 650;
    const aspect = width / height;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(4.5, 1.9, 5.0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 4. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = false; // Prevents mouse wheel scroll hijacking so page scrolls ultra-smoothly!
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.controls.minDistance = 0.4;
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
    this.ambientLight = new THREE.AmbientLight(0xfff8ee, 1.4);
    this.scene.add(this.ambientLight);

    this.keySpotLight = new THREE.SpotLight(0xfff3e0, 3.6);
    this.keySpotLight.position.set(4.5, 7.5, 4.5);
    this.keySpotLight.angle = Math.PI / 3.6;
    this.keySpotLight.penumbra = 0.65;
    this.keySpotLight.castShadow = true;
    this.keySpotLight.shadow.mapSize.width = 2048;
    this.keySpotLight.shadow.mapSize.height = 2048;
    this.keySpotLight.shadow.bias = -0.0001;
    this.scene.add(this.keySpotLight);

    this.fillLight = new THREE.DirectionalLight(0xa7beae, 1.6);
    this.fillLight.position.set(-6, 4, -4);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0xb85042, 2.2);
    this.rimLight.position.set(0, 4.5, -6);
    this.scene.add(this.rimLight);
  }

  private setupShowroomStage(): void {
    // Polished Circular Turntable Platform
    const stageGeo = new THREE.CylinderGeometry(4.8, 5.0, 0.16, 64);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x181c1e,
      roughness: 0.14,
      metalness: 0.85
    });
    this.turntableMesh = new THREE.Mesh(stageGeo, stageMat);
    this.turntableMesh.position.y = -0.08;
    this.turntableMesh.receiveShadow = true;
    this.scene.add(this.turntableMesh);

    // Glowing Terracotta Outer Ring (#b85042)
    const ringGeo = new THREE.RingGeometry(4.82, 4.96, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xb85042,
      side: THREE.DoubleSide
    });
    const neonRing = new THREE.Mesh(ringGeo, ringMat);
    neonRing.rotation.x = -Math.PI / 2;
    neonRing.position.y = 0.002;
    this.scene.add(neonRing);

    // Softbox Light Panel overhead
    const softboxGeo = new THREE.PlaneGeometry(6.5, 4.2);
    const softboxMat = new THREE.MeshBasicMaterial({
      color: 0xe7e8d1,
      side: THREE.DoubleSide
    });
    this.ceilingSoftbox = new THREE.Mesh(softboxGeo, softboxMat);
    this.ceilingSoftbox.rotation.x = Math.PI / 2;
    this.ceilingSoftbox.position.set(0, 5.2, 0);
    this.scene.add(this.ceilingSoftbox);

    // Floor Grid (#a7beae / sage)
    this.floorGrid = new THREE.GridHelper(26, 26, 0xb85042, 0x242d2a);
    this.floorGrid.position.y = -0.085;
    this.floorGrid.material.opacity = 0.45;
    this.floorGrid.material.transparent = true;
    this.scene.add(this.floorGrid);
  }

  public buildCarModel(car: CarModel): void {
    if (!this.scene) return;
    this.currentCar = car;
    this.currentHotspots = car.hotspots || [];

    // Remove previous car parts
    while (this.carRootGroup.children.length > 0) {
      const child = this.carRootGroup.children[0];
      this.carRootGroup.remove(child);
    }

    // Remove old headlight beams
    this.headlightBeams.forEach(b => {
      this.scene.remove(b.target);
      this.scene.remove(b);
    });
    this.headlightBeams = [];
    this.headlightMeshes = [];
    this.carBodyMaterials = [];
    this.carInteriorMaterials = [];
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
      clearcoatRoughness: 0.08,
      reflectivity: 1.0
    });
    this.carBodyMaterials.push(bodyMat);

    // Carbon Fiber Material
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x151515,
      metalness: 0.8,
      roughness: 0.28
    });

    // Tinted Glass Material
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x060c14,
      metalness: 0.15,
      roughness: 0.04,
      transmission: 0.8,
      transparent: true,
      opacity: 0.82,
      reflectivity: 0.95
    });

    // Interior Alcantara Material
    const interiorTheme = car.interiorThemes[0] || {
      primaryHex: '#1a1a1a',
      accentHex: '#dc0616'
    };
    const interiorBaseMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(interiorTheme.primaryHex),
      roughness: 0.88,
      metalness: 0.08
    });
    const interiorAccentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(interiorTheme.accentHex),
      roughness: 0.65,
      metalness: 0.18
    });
    this.carInteriorMaterials.push(interiorBaseMat, interiorAccentMat);

    const isLambo = car.id.includes('revuelto') || car.id.includes('lambo');
    const isBugatti = car.id.includes('bugatti');
    const isPagani = car.id.includes('pagani');
    const isPorsche = car.id.includes('porsche');
    const isDodge = car.id.includes('demon') || car.id.includes('dodge');

    /* ====================================================
       1. MAIN LOWER CHASSIS & AERODYNAMIC BODY
       ==================================================== */
    const mainBodyGeo = new THREE.BoxGeometry(
      isDodge ? 2.08 : 1.96,
      0.46,
      isBugatti ? 4.6 : 4.4
    );
    const mainBody = new THREE.Mesh(mainBodyGeo, bodyMat);
    mainBody.position.set(0, 0.45, 0);
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    this.carRootGroup.add(mainBody);

    // Front Sloped Aero Nose
    const noseLength = isDodge ? 1.4 : 1.35;
    const noseGeo = new THREE.CylinderGeometry(
      isDodge ? 0.98 : 0.86,
      0.96,
      noseLength,
      isLambo ? 6 : 24
    );
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.rotation.x = Math.PI / 2;
    nose.scale.set(1.1, 0.38, 1.0);
    nose.position.set(0, 0.42, 1.62);
    nose.castShadow = true;
    this.carRootGroup.add(nose);

    // Front Carbon Splitter
    const splitterGeo = new THREE.BoxGeometry(2.02, 0.06, 0.65);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, 0.18, 2.22);
    splitter.castShadow = true;
    this.carRootGroup.add(splitter);

    // Side Skirts
    const skirtGeo = new THREE.BoxGeometry(0.12, 0.06, 2.45);
    const leftSkirt = new THREE.Mesh(skirtGeo, carbonMat);
    leftSkirt.position.set(-1.03, 0.2, 0);
    const rightSkirt = leftSkirt.clone();
    rightSkirt.position.set(1.03, 0.2, 0);
    this.carRootGroup.add(leftSkirt, rightSkirt);

    // Rear Aero Diffuser
    const diffuserGeo = new THREE.BoxGeometry(1.88, 0.26, 0.48);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonMat);
    diffuser.rotation.x = 0.2;
    diffuser.position.set(0, 0.3, -2.16);
    diffuser.castShadow = true;
    this.carRootGroup.add(diffuser);

    /* ====================================================
       2. COCKPIT GREENHOUSE (WINDSHIELD, ROOF, CANOPY)
       ==================================================== */
    const cabinWidth = isDodge ? 1.52 : 1.36;
    const cabinLength = isBugatti ? 2.15 : 1.98;
    const cabinGeo = new THREE.BoxGeometry(cabinWidth, 0.54, cabinLength);
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.set(0, 0.88, -0.15);
    cabin.castShadow = true;
    this.carRootGroup.add(cabin);

    // Front Windshield
    const windshieldGeo = new THREE.PlaneGeometry(1.32, 0.78);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 0.85, 0.74);
    windshield.rotation.x = -Math.PI / 3.4;
    this.carRootGroup.add(windshield);

    // Rear Engine Glass
    const rearGlassGeo = new THREE.PlaneGeometry(1.22, 0.92);
    const rearGlass = new THREE.Mesh(rearGlassGeo, glassMat);
    rearGlass.position.set(0, 0.83, -1.06);
    rearGlass.rotation.x = Math.PI / 3.4;
    this.carRootGroup.add(rearGlass);

    // Side Windows
    const sideWinGeo = new THREE.PlaneGeometry(1.32, 0.38);
    const leftWin = new THREE.Mesh(sideWinGeo, glassMat);
    leftWin.rotation.y = Math.PI / 2;
    leftWin.position.set(-0.69, 0.86, -0.1);
    const rightWin = leftWin.clone();
    rightWin.position.x = 0.69;
    rightWin.rotation.y = -Math.PI / 2;
    this.carRootGroup.add(leftWin, rightWin);

    /* ====================================================
       3. INTERIOR COCKPIT (THE ZOOM-IN EXPERIENCE!)
       ==================================================== */
    // Floor Tub
    const tubGeo = new THREE.BoxGeometry(1.3, 0.1, 1.62);
    const tub = new THREE.Mesh(tubGeo, interiorBaseMat);
    tub.position.set(0, 0.32, -0.05);
    this.carRootGroup.add(tub);

    // Dashboard
    const dashGeo = new THREE.BoxGeometry(1.24, 0.3, 0.46);
    const dash = new THREE.Mesh(dashGeo, interiorBaseMat);
    dash.position.set(0, 0.75, 0.56);
    this.carRootGroup.add(dash);

    // Digital Cluster HUD
    const screenGeo = new THREE.PlaneGeometry(0.38, 0.16);
    const screenCanvas = this.createDigitalClusterCanvas(car);
    const screenTex = new THREE.CanvasTexture(screenCanvas);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(-0.32, 0.82, 0.44);
    screenMesh.rotation.x = -0.3;
    this.carRootGroup.add(screenMesh);

    // Steering Wheel Group
    const wheelGroup = new THREE.Group();
    const rimTorus = new THREE.TorusGeometry(0.14, 0.02, 16, 32);
    const steeringMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.5,
      metalness: 0.3
    });
    const steeringRim = new THREE.Mesh(rimTorus, steeringMat);
    wheelGroup.add(steeringRim);

    // Center Horn
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

    wheelGroup.position.set(-0.32, 0.75, 0.27);
    wheelGroup.rotation.x = -0.35;
    this.carRootGroup.add(wheelGroup);

    // Driver & Passenger Sport Bucket Seats
    const seatGeo = new THREE.BoxGeometry(0.42, 0.68, 0.45);
    const driverSeat = new THREE.Mesh(seatGeo, interiorBaseMat);
    driverSeat.position.set(-0.32, 0.56, -0.22);
    driverSeat.rotation.x = -0.15;

    const stripeGeo = new THREE.BoxGeometry(0.08, 0.69, 0.46);
    const driverStripe = new THREE.Mesh(stripeGeo, interiorAccentMat);
    driverStripe.position.set(-0.32, 0.56, -0.22);
    driverStripe.rotation.x = -0.15;

    const passSeat = driverSeat.clone();
    passSeat.position.x = 0.32;
    const passStripe = driverStripe.clone();
    passStripe.position.x = 0.32;

    this.carRootGroup.add(driverSeat, driverStripe, passSeat, passStripe);

    // Center Console
    const consoleGeo = new THREE.BoxGeometry(0.2, 0.22, 0.7);
    const centerConsole = new THREE.Mesh(consoleGeo, carbonMat);
    centerConsole.position.set(0, 0.45, 0.05);
    this.carRootGroup.add(centerConsole);

    /* ====================================================
       4. DISTINCTIVE SUPERCAR WINGS & AERO
       ==================================================== */
    if (isPorsche) {
      const wingGeo = new THREE.BoxGeometry(2.0, 0.04, 0.45);
      const wing = new THREE.Mesh(wingGeo, carbonMat);
      wing.position.set(0, 1.25, -1.9);

      const pylonGeo = new THREE.BoxGeometry(0.04, 0.55, 0.15);
      const pylonL = new THREE.Mesh(pylonGeo, carbonMat);
      pylonL.position.set(-0.55, 1.0, -1.8);
      const pylonR = pylonL.clone();
      pylonR.position.x = 0.55;
      this.carRootGroup.add(wing, pylonL, pylonR);
    } else if (isBugatti) {
      const horseshoeGeo = new THREE.TorusGeometry(0.22, 0.05, 16, 32, Math.PI);
      const horseMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.95, roughness: 0.1 });
      const horseshoe = new THREE.Mesh(horseshoeGeo, horseMat);
      horseshoe.rotation.x = Math.PI / 2;
      horseshoe.position.set(0, 0.38, 2.22);
      this.carRootGroup.add(horseshoe);

      const wingGeo = new THREE.BoxGeometry(1.6, 0.05, 0.4);
      const wing = new THREE.Mesh(wingGeo, carbonMat);
      wing.position.set(0, 0.88, -2.05);
      this.carRootGroup.add(wing);
    } else if (isPagani) {
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.3), carbonMat);
      wingL.position.set(-0.6, 0.88, -1.95);
      const wingR = wingL.clone();
      wingR.position.x = 0.6;
      this.carRootGroup.add(wingL, wingR);
    } else if (isDodge) {
      const scoopGeo = new THREE.BoxGeometry(0.7, 0.09, 0.6);
      const scoop = new THREE.Mesh(scoopGeo, carbonMat);
      scoop.position.set(0, 0.65, 1.45);
      this.carRootGroup.add(scoop);
    } else {
      const aeroFlap = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.35), carbonMat);
      aeroFlap.position.set(0, 0.82, -1.9);
      this.carRootGroup.add(aeroFlap);
    }

    /* ====================================================
       5. QUAD HEADLIGHTS & NEON TAILLIGHTS
       ==================================================== */
    const headMat = new THREE.MeshBasicMaterial({ color: 0xe8f4ff });
    const headGeo = new THREE.BoxGeometry(0.3, 0.08, 0.2);

    const leftHead = new THREE.Mesh(headGeo, headMat);
    leftHead.position.set(-0.75, 0.52, 2.05);
    const rightHead = leftHead.clone();
    rightHead.position.x = 0.75;
    this.carRootGroup.add(leftHead, rightHead);
    this.headlightMeshes.push(leftHead, rightHead);

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

    // Taillight
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0d25 });
    const tailGeo = new THREE.BoxGeometry(1.7, 0.06, 0.08);
    const taillight = new THREE.Mesh(tailGeo, tailMat);
    taillight.position.set(0, 0.65, -2.18);
    this.carRootGroup.add(taillight);
    this.taillightMeshes.push(taillight);

    // Exhausts
    const tipGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 16);
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0x334455,
      metalness: 0.95,
      roughness: 0.1
    });

    if (isPagani) {
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
      const exhaustOffsets = [-0.65, -0.52, 0.52, 0.65];
      exhaustOffsets.forEach(x => {
        const pipe = new THREE.Mesh(tipGeo, tipMat);
        pipe.rotation.x = Math.PI / 2;
        pipe.position.set(x, 0.38, -2.2);
        this.carRootGroup.add(pipe);
      });
    }

    /* ====================================================
       6. PERFORMANCE WHEELS & BREMBO CALIPERS
       ==================================================== */
    this.wheelsGroup = new THREE.Group();
    const wheelPositions = [
      [-0.96, 0.34, 1.35],
      [0.96, 0.34, 1.35],
      [-0.98, 0.36, -1.35],
      [0.98, 0.36, -1.35]
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const singleWheel = this.createPerformanceWheel(x > 0);
      singleWheel.position.set(x, y, z);
      this.wheelsGroup.add(singleWheel);
    });
    this.carRootGroup.add(this.wheelsGroup);
  }

  private createPerformanceWheel(isRightSide: boolean): THREE.Group {
    const wheel = new THREE.Group();

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

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x22262a,
      metalness: 0.95,
      roughness: 0.15
    });
    const rimCenterGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.27, 24);
    const rimCenter = new THREE.Mesh(rimCenterGeo, rimMat);
    rimCenter.rotation.z = Math.PI / 2;
    wheel.add(rimCenter);

    const spokeGeo = new THREE.BoxGeometry(0.28, 0.02, 0.03);
    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(spokeGeo, rimMat);
      spoke.rotation.x = (i * Math.PI) / 5;
      spoke.position.x = isRightSide ? 0.08 : -0.08;
      wheel.add(spoke);
    }

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

    const caliperGeo = new THREE.BoxGeometry(0.06, 0.12, 0.08);
    const caliperMat = new THREE.MeshStandardMaterial({
      color: 0xb85042,
      metalness: 0.8,
      roughness: 0.2
    });
    const caliper = new THREE.Mesh(caliperGeo, caliperMat);
    caliper.position.set(isRightSide ? 0.05 : -0.05, 0.12, 0.0);
    wheel.add(caliper);

    return wheel;
  }

  private createDigitalClusterCanvas(car: CarModel): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#111416';
      ctx.fillRect(0, 0, 512, 256);

      ctx.strokeStyle = '#b85042';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 492, 236);

      ctx.fillStyle = '#e7e8d1';
      ctx.font = 'bold 74px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${car.topSpeedKmh}`, 256, 120);

      ctx.fillStyle = '#a7beae';
      ctx.font = '22px sans-serif';
      ctx.fillText('KM/H  |  GEAR 7  |  RACE MODE', 256, 160);

      ctx.fillStyle = '#b85042';
      ctx.fillRect(50, 190, 412, 14);

      ctx.fillStyle = '#e7e8d1';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(car.name.toUpperCase(), 256, 45);
    }
    return canvas;
  }

  public setCameraPreset(preset: CameraPreset): void {
    if (!this.camera || !this.controls) return;

    let targetCamPos = { x: 4.5, y: 1.9, z: 5.0 };
    let targetLookAt = { x: 0, y: 0.6, z: 0 };
    this.isInteriorView = false;

    switch (preset) {
      case 'cockpit':
        this.isInteriorView = true;
        targetCamPos = { x: -0.32, y: 0.85, z: 0.06 };
        targetLookAt = { x: -0.32, y: 0.82, z: 1.5 };
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
        targetCamPos = { x: 4.5, y: 1.9, z: 5.0 };
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

  public setPaintColor(hex: string, metallic: number = 0.9, roughness: number = 0.18): void {
    const color = new THREE.Color(hex);
    this.carBodyMaterials.forEach(mat => {
      mat.color = color;
      mat.metalness = metallic;
      mat.roughness = roughness;
      mat.needsUpdate = true;
    });
  }

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

  public toggleShowroomMode(): boolean {
    this.isNightMode = !this.isNightMode;
    if (this.isNightMode) {
      this.scene.background = new THREE.Color(0x020408);
      this.scene.fog = new THREE.FogExp2(0x020408, 0.05);
      this.ambientLight.intensity = 0.2;
      this.keySpotLight.intensity = 1.0;
      this.fillLight.intensity = 0.4;
      this.ceilingSoftbox.visible = false;
      this.floorGrid.material.opacity = 0.6;
    } else {
      this.scene.background = new THREE.Color(0x080a0f);
      this.scene.fog = new THREE.FogExp2(0x080a0f, 0.035);
      this.ambientLight.intensity = 0.7;
      this.keySpotLight.intensity = 2.8;
      this.fillLight.intensity = 1.4;
      this.ceilingSoftbox.visible = true;
      this.floorGrid.material.opacity = 0.4;
    }
    return this.isNightMode;
  }

  private onWindowResize = (): void => {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.parentElement?.clientWidth || window.innerWidth;
    const height = this.canvas.parentElement?.clientHeight || 650;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private updateHotspotPositions(): void {
    if (!this.onHotspotsUpdated || !this.currentHotspots.length || !this.camera || !this.canvas) return;

    const widthHalf = this.canvas.clientWidth / 2;
    const heightHalf = this.canvas.clientHeight / 2;

    const projected = this.currentHotspots.map(h => {
      const pos = new THREE.Vector3(...h.position);
      pos.applyMatrix4(this.carRootGroup.matrixWorld);
      pos.project(this.camera);

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

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (!this.isInteriorView && this.turntableMesh) {
      this.turntableMesh.rotation.y += 0.001;
    }

    this.controls?.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
      this.updateHotspotPositions();
    }
  };

  public destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer?.dispose();
  }
}
