import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarService } from './services/car.service';
import { ThreeShowroomService, CameraPreset } from './services/three-showroom.service';
import { AudioService } from './services/audio.service';
import { CarModel, ColorOption, CarHotspot, TestDriveRequest, CustomBuildRequest, ShowroomStats } from './models/car.model';

interface ScreenHotspot {
  id: string;
  title: string;
  description: string;
  category: string;
  x: number;
  y: number;
  visible: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasRef') canvasRef?: ElementRef<HTMLCanvasElement>;

  // Data signals and state
  public cars = signal<CarModel[]>([]);
  public filteredCars = signal<CarModel[]>([]);
  public selectedBrandFilter = signal<string>('All');
  public selectedCar = signal<CarModel | null>(null);
  public selectedColor = signal<ColorOption | null>(null);
  public activeCameraPreset = signal<CameraPreset>('orbit');
  public showroomStats = signal<ShowroomStats | null>(null);

  // Screen-projected 3D hotspots
  public screenHotspots = signal<ScreenHotspot[]>([]);
  public selectedHotspot = signal<CarHotspot | null>(null);

  // UI Toggles
  public isNightMode = signal<boolean>(false);
  public areHeadlightsOn = signal<boolean>(true);
  public isMuted = signal<boolean>(false);
  public isRevving = signal<boolean>(false);
  public isCustomizerOpen = signal<boolean>(true);
  public is3DReady = signal<boolean>(false);
  public isCockpitRealViewOpen = signal<boolean>(false);
  public cockpitZoomLevel = signal<number>(1.0);
  public heroViewMode = signal<'real360' | '3d'>('real360');
  public real360AngleIndex = signal<number>(0);
  public isAutoSpinning = signal<boolean>(false);
  private autoSpinInterval: any = null;
  public isDragging360: boolean = false;
  private dragStartX: number = 0;
  private dragStartIndex: number = 0;

  // Modals
  public isTestDriveModalOpen = signal<boolean>(false);
  public isCustomBuildModalOpen = signal<boolean>(false);
  public modalSuccessMessage = signal<string | null>(null);

  // Form Models
  public testDriveForm: TestDriveRequest = {
    fullName: '',
    email: '',
    phone: '',
    preferredDate: '',
    carId: '',
    dealershipLocation: 'Dubai Flagship Atelier',
    notes: ''
  };

  public customBuildForm: CustomBuildRequest = {
    customerName: '',
    customerEmail: '',
    carId: '',
    colorName: '',
    colorHex: '',
    interiorName: 'Alcantara Racing Trim',
    wheelsStyle: 'Forged Monoblock Titanium',
    estimatedTotal: 0
  };

  constructor(
    private carService: CarService,
    private threeShowroom: ThreeShowroomService,
    private audioService: AudioService
  ) {}

  ngOnInit(): void {
    this.carService.getCars().subscribe(cars => {
      this.cars.set(cars);
      this.filteredCars.set(cars);
      if (cars.length > 0 && !this.selectedCar()) {
        this.selectedCar.set(cars[0]);
        this.selectedColor.set(cars[0].availableColors[0] || null);
        this.testDriveForm.carId = cars[0].id;
        this.customBuildForm.carId = cars[0].id;
        this.customBuildForm.colorName = cars[0].availableColors[0]?.name || '';
        this.customBuildForm.colorHex = cars[0].availableColors[0]?.hex || '';
        this.customBuildForm.estimatedTotal = cars[0].startingPrice;
        setTimeout(() => this.tryInit3D(), 50);
      }
    });

    this.carService.getStats().subscribe(stats => {
      this.showroomStats.set(stats);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.tryInit3D();
    }, 100);
  }

  private tryInit3D(): void {
    if (this.is3DReady() || !this.canvasRef || !this.selectedCar()) return;
    this.threeShowroom.init(this.canvasRef, this.selectedCar()!);
    this.is3DReady.set(true);

    this.threeShowroom.onHotspotsUpdated = (positions) => {
      const car = this.selectedCar();
      if (!car) return;

      const mapped: ScreenHotspot[] = positions.map(pos => {
        const hs = car.hotspots?.find(h => h.id === pos.id);
        return {
          id: pos.id,
          title: hs?.title || '',
          description: hs?.description || '',
          category: hs?.category || 'Feature',
          x: pos.x,
          y: pos.y,
          visible: pos.visible
        };
      });
      this.screenHotspots.set(mapped);
    };
  }

  public setHeroViewMode(mode: 'real360' | '3d'): void {
    this.heroViewMode.set(mode);
    this.audioService.playClick();
  }

  public set360Angle(index: number): void {
    const total = this.selectedCar()?.real360Angles?.length || 8;
    const normalized = ((index % total) + total) % total;
    this.real360AngleIndex.set(normalized);
  }

  public next360Angle(): void {
    this.set360Angle(this.real360AngleIndex() + 1);
  }

  public prev360Angle(): void {
    this.set360Angle(this.real360AngleIndex() - 1);
  }

  public toggleAutoSpin(): void {
    if (this.isAutoSpinning()) {
      this.stopAutoSpin();
    } else {
      this.startAutoSpin();
    }
    this.audioService.playClick();
  }

  public startAutoSpin(): void {
    this.isAutoSpinning.set(true);
    if (this.autoSpinInterval) clearInterval(this.autoSpinInterval);
    this.autoSpinInterval = setInterval(() => {
      this.next360Angle();
    }, 1400);
  }

  public stopAutoSpin(): void {
    this.isAutoSpinning.set(false);
    if (this.autoSpinInterval) {
      clearInterval(this.autoSpinInterval);
      this.autoSpinInterval = null;
    }
  }

  public on360DragStart(e: MouseEvent | TouchEvent): void {
    this.stopAutoSpin();
    this.isDragging360 = true;
    this.dragStartX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    this.dragStartIndex = this.real360AngleIndex();
  }

  public on360DragMove(e: MouseEvent | TouchEvent): void {
    if (!this.isDragging360) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - this.dragStartX;
    const stepThreshold = 40;
    const steps = Math.floor(deltaX / stepThreshold);
    this.set360Angle(this.dragStartIndex - steps);
  }

  public on360DragEnd(): void {
    this.isDragging360 = false;
  }

  public currentAngleDegrees(): number {
    return this.real360AngleIndex() * 45;
  }

  public currentAngleLabel(): string {
    const labels = [
      '0° Front Three-Quarter',
      '45° Front Dynamic Aero',
      '90° Side Profile Stance',
      '135° Rear Three-Quarter',
      '180° Direct Rear & Diffuser',
      '225° Rear Dynamic Track',
      '270° Left Side Silhouette',
      '315° Front Headlight Stance'
    ];
    return labels[this.real360AngleIndex()] || `${this.currentAngleDegrees()}° Real Angle`;
  }

  public getCurrentRealAngleImage(): string {
    const car = this.selectedCar();
    if (!car) return '';
    if (car.real360Angles && car.real360Angles.length > 0) {
      return car.real360Angles[this.real360AngleIndex()] || car.imageUrl || '';
    }
    return car.imageUrl || '';
  }

  public selectCar(car: CarModel): void {
    this.selectedCar.set(car);
    this.selectedColor.set(car.availableColors[0] || null);
    this.activeCameraPreset.set('orbit');
    this.selectedHotspot.set(null);

    this.testDriveForm.carId = car.id;
    this.customBuildForm.carId = car.id;
    this.customBuildForm.colorName = car.availableColors[0]?.name || '';
    this.customBuildForm.colorHex = car.availableColors[0]?.hex || '';
    this.customBuildForm.estimatedTotal = car.startingPrice;

    if (this.is3DReady()) {
      this.threeShowroom.buildCarModel(car);
      this.threeShowroom.setCameraPreset('orbit');
    } else {
      setTimeout(() => this.tryInit3D(), 50);
    }
    this.audioService.playClick();
  }

  public loadAndScrollTo3D(car: CarModel): void {
    this.selectCar(car);
    const showroomSection = document.getElementById('showroom-section');
    if (showroomSection) {
      showroomSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  public filterByBrand(brand: string): void {
    this.selectedBrandFilter.set(brand);
    if (brand === 'All') {
      this.filteredCars.set(this.cars());
    } else {
      this.filteredCars.set(this.cars().filter(c => c.brand.toLowerCase() === brand.toLowerCase()));
    }
    this.audioService.playClick();
  }

  public selectColor(color: ColorOption): void {
    this.selectedColor.set(color);
    this.customBuildForm.colorName = color.name;
    this.customBuildForm.colorHex = color.hex;
    this.threeShowroom.setPaintColor(color.hex, color.metallic, color.roughness);
    this.audioService.playClick();
  }

  public toggleCockpitRealView(): void {
    const nextState = !this.isCockpitRealViewOpen();
    this.isCockpitRealViewOpen.set(nextState);
    this.cockpitZoomLevel.set(1.0);
    this.audioService.playClick();
  }

  public setCockpitZoom(level: number): void {
    this.cockpitZoomLevel.set(level);
    this.audioService.playClick();
  }

  public setCameraView(preset: CameraPreset): void {
    this.activeCameraPreset.set(preset);
    this.threeShowroom.setCameraPreset(preset);
    this.audioService.playClick();
  }

  public toggleHeadlights(): void {
    const state = this.threeShowroom.toggleHeadlights();
    this.areHeadlightsOn.set(state);
    this.audioService.playClick();
  }

  public toggleShowroomLighting(): void {
    const isNight = this.threeShowroom.toggleShowroomMode();
    this.isNightMode.set(isNight);
    this.audioService.playClick();
  }

  public toggleAudio(): void {
    const muted = this.audioService.toggleMute();
    this.isMuted.set(muted);
  }

  public onRevEngineStart(): void {
    this.isRevving.set(true);
    const brand = this.selectedCar()?.brand || 'Ferrari';
    this.audioService.revEngine(brand);
  }

  public onRevEngineEnd(): void {
    this.isRevving.set(false);
  }

  public openHotspot(hotspotId: string): void {
    const hs = this.selectedCar()?.hotspots.find(h => h.id === hotspotId);
    if (hs) {
      this.selectedHotspot.set(hs);
      if (hs.category === 'Engine') this.setCameraView('engine');
      else if (hs.category === 'Cockpit') this.setCameraView('cockpit');
      else if (hs.category === 'Aero') this.setCameraView('aero');
      else if (hs.category === 'Wheels') this.setCameraView('brakes');
      this.audioService.playClick();
    }
  }

  public closeHotspot(): void {
    this.selectedHotspot.set(null);
  }

  public scrollTo(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      this.audioService.playClick();
    }
  }

  public openTestDriveModal(): void {
    this.modalSuccessMessage.set(null);
    this.isTestDriveModalOpen.set(true);
    this.audioService.playClick();
  }

  public closeTestDriveModal(): void {
    this.isTestDriveModalOpen.set(false);
  }

  public submitTestDrive(): void {
    if (!this.testDriveForm.fullName || !this.testDriveForm.email) {
      alert('Please enter your full name and email.');
      return;
    }
    this.carService.submitTestDrive(this.testDriveForm).subscribe(res => {
      this.modalSuccessMessage.set(res.message);
      setTimeout(() => {
        this.closeTestDriveModal();
        this.modalSuccessMessage.set(null);
      }, 3000);
    });
  }

  public openCustomBuildModal(): void {
    this.modalSuccessMessage.set(null);
    this.isCustomBuildModalOpen.set(true);
    this.audioService.playClick();
  }

  public closeCustomBuildModal(): void {
    this.isCustomBuildModalOpen.set(false);
  }

  public submitCustomBuild(): void {
    if (!this.customBuildForm.customerName || !this.customBuildForm.customerEmail) {
      alert('Please enter your contact details.');
      return;
    }
    this.carService.submitCustomBuild(this.customBuildForm).subscribe(res => {
      this.modalSuccessMessage.set(res.message);
      setTimeout(() => {
        this.closeCustomBuildModal();
        this.modalSuccessMessage.set(null);
      }, 3000);
    });
  }

  ngOnDestroy(): void {
    this.stopAutoSpin();
    this.threeShowroom.destroy();
  }
}
