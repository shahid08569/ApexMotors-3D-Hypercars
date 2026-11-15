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
  @ViewChild('canvasRef', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // Data signals and state
  public cars = signal<CarModel[]>([]);
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
    dealershipLocation: 'Dubai Marina Luxury Atelier',
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
      if (cars.length > 0) {
        this.selectCar(cars[0]);
      }
    });

    this.carService.getStats().subscribe(stats => {
      this.showroomStats.set(stats);
    });
  }

  ngAfterViewInit(): void {
    if (this.selectedCar()) {
      this.init3D(this.selectedCar()!);
    }

    // Connect 3D Hotspot updates to 2D UI overlay
    this.threeShowroom.onHotspotsUpdated = (positions) => {
      const car = this.selectedCar();
      if (!car) return;

      const mapped: ScreenHotspot[] = positions.map(pos => {
        const hs = car.hotspots.find(h => h.id === pos.id);
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

  private init3D(car: CarModel): void {
    this.threeShowroom.init(this.canvasRef, car);
  }

  public selectCar(car: CarModel): void {
    this.selectedCar.set(car);
    this.selectedColor.set(car.availableColors[0] || null);
    this.activeCameraPreset.set('orbit');
    this.selectedHotspot.set(null);

    // Update form defaults
    this.testDriveForm.carId = car.id;
    this.customBuildForm.carId = car.id;
    this.customBuildForm.colorName = car.availableColors[0]?.name || '';
    this.customBuildForm.colorHex = car.availableColors[0]?.hex || '';
    this.customBuildForm.estimatedTotal = car.startingPrice;

    // Trigger 3D regeneration
    this.threeShowroom.buildCarModel(car);
    this.threeShowroom.setCameraPreset('orbit');
    this.audioService.playClick();
  }

  public selectColor(color: ColorOption): void {
    this.selectedColor.set(color);
    this.customBuildForm.colorName = color.name;
    this.customBuildForm.colorHex = color.hex;
    this.threeShowroom.setPaintColor(color.hex, color.metallic, color.roughness);
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
      // Focus camera on that component
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

  // Modals handling
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
      alert('Please enter your full name and email address.');
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
    this.threeShowroom.destroy();
  }
}
