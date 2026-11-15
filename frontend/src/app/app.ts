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
      }
    });

    this.carService.getStats().subscribe(stats => {
      this.showroomStats.set(stats);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.canvasRef && this.selectedCar()) {
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
    }, 100);
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
    this.threeShowroom.destroy();
  }
}
