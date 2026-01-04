import { Component, OnInit, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { icon, Map, marker, Marker, popup, tileLayer } from 'leaflet';
import { Subject, take, takeUntil } from 'rxjs';
import { SchoolService } from '../../../services/apis/school.service';
import { BusService } from '../../../services/apis/bus.service';
import { SchoolLocationService } from '../../../services/apis/schoolLocation.service';
import { TripsService } from '../../../services/apis/trip.service';
import { ITransferdTrip } from '../../../shared/model/trip';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatRadioGroup, MatRadioButton } from "@angular/material/radio";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatSelect, MatOption } from "@angular/material/select";
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { DatePipe } from '@angular/common';
import { TrackingService } from '../../../services/apis/tracking.service';
import { IschoolLocation } from '../../../shared/model/schoolLocation';
import { IBus } from '../../../shared/model/bus';
type TTrip=ITransferdTrip&{isTrack?:boolean,isEnd?:boolean,currentLocation?:number[],driver_speed?:number,busName?:string,activeUsersNumber?:number};
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [MatExpansionModule,
    MatRadioGroup,
    MatRadioButton,
    MatFormField,
    MatSelect,
    MatLabel,
    MatOption,
    LeafletModule,
    TranslatePipe
  ],
  providers: [DatePipe],
})
export class DashboardComponent implements OnInit {
  options = signal<any>(null);
  trips:TTrip[]=[];
  dropDownTrips  =signal<ITransferdTrip[]>([]);
  buses:IBus[]=[];
  locations  =signal<IschoolLocation[]>([]);
  schoolLocation: string = '';
  trackingMap: Map =undefined!;
  activeUsersNumber= signal<number>(0);
  inActiveTripsNumber= signal<number>(0);
  activeTripsNumber= signal<number>(0);
  inWorkingTripsNumber= signal<number>(0);
  errorMessage = signal('')
  date = new Date();
  toSchool = signal(true);
  filter: {
    trip: string,
    location: string,
    status: number,
    time: 'M' | 'E'
  } = {
      trip: '',
      location: '',
      status: -1,
      time: this.toSchool() ? 'M' : 'E'
    };

  //for one trip
  selectedTrip: ITransferdTrip[] = [];
  $tracking: Subject<void> = new Subject<void>();
  constructor(private schoolService: SchoolService,
    private schoolLocationService:SchoolLocationService ,
    private translate: TranslateService, 
    private tripService: TripsService,
    private trackingService:TrackingService,
    private datePipe:DatePipe,
    private busService: BusService) {
    this.schoolLocation = this.schoolService.getSchoolFromLocalStorage()?.location||'';
  }
  ngOnInit(): void {
    this.options.set({
      layers: [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        })
      ],
      zoom: 13,
      center: this.schoolLocation ? this.schoolLocation.split(',').map(Number) : [30.033, 31.233]
    })
    this.busService.getBuses().pipe(take(1)).subscribe({
      next: buses => {
        this.buses= buses.responce || [];
      }
    });
    this.schoolLocationService.getSchoolLocations().pipe(take(1)).subscribe({
      next: locations => {
        this.locations.set(locations.responce || []);
      }
    });
  }
  getLocaleDirection() {
    const minLat = 29.95;
    const maxLat = 30.15;
    const minLng = 31.20;
    const maxLng = 31.35;
    const lat = Math.random() * (maxLat - minLat) + minLat;
    const lng = Math.random() * (maxLng - minLng) + minLng;
    return `${lat},${lng}`
  }
  onMapReady(map: Map) {
    this.tripService.getTripsList().subscribe({
      next: trips => {
        this.dropDownTrips.set( [...(trips.responce||[])]);
        this.trips=trips.responce?.map(p => { return { ...p, isTrack: true } })??[];
        this.trackingMap = map;
        this.getTracking(this.datePipe.transform(this.date, 'dd-MM-yyyy')!);
      }
    }
    )
  }
  removeMarkers() {
    this.trackingMap.eachLayer((layer) => {
      if (layer instanceof Marker) {
        layer.remove();
      }
    });
  }
  tripKey(trip:ITransferdTrip) {
    return this.toSchool() ? trip?.morning?.key ?? "" : trip?.evening?.key ?? "";
  }
  getTracking(date: string) {
    this.removeMarkers();
    let isNotFindTracking = true;
    if (this.$tracking) {
      this.$tracking.next();
      this.$tracking.complete();
    }
    this.$tracking = new Subject<void>();
    this.trips.forEach((t, index) => {
      let tripMarker: Marker;
      const key = this.toSchool() ? t?.morning?.key ?? "" : t?.evening?.key ?? "";
      const isEnd = this.toSchool() ? t?.morning?.status==2: t?.evening?.status==2;
      if (key)
        this.trackingService.getTrackingByTrip(date, key).pipe(takeUntil(this.$tracking)).subscribe({
          next: (tracking) => {
            if (tracking) {
              isNotFindTracking = false;
              this.errorMessage.set('');
              this.trips[index] = {
                ...t,
                isEnd: isEnd,
                activeUsersNumber: tracking?.responce?.active_users ? Object.keys(tracking.responce.active_users).length : 0,
                currentLocation: tracking?.responce?.current_location ? tracking.responce.current_location.split(',').map(Number) : undefined,
                driver_speed: tracking?.responce?.driver_speed || 0,
                busName: this.buses.find(b => b.key === t.bus)?.name || ''
              }
              if(tripMarker){
                this.trackingMap.removeLayer(tripMarker);
              }
              this.isTripMatchFilter(this.trips[index]) ? this.trips[index].isTrack = true : this.trips[index].isTrack = false;
              if (this.trips[index].isTrack){
                tripMarker=this.setMarker(this.trackingMap,tripMarker, this.trips[index]);
              }
            }else{
              this.trips[index] = {
                ...t,
                isEnd: isEnd,
                busName: this.buses.find(b => b.key === t.bus)?.name || ''
              }
            }
            if (this.trips.length > 0) {
              this.inActiveTripsNumber.set(this.trips.filter(t => t.isEnd == true).length);
              this.activeTripsNumber.set(this.trips.filter(t => t.isEnd == false).length);
            }
            if (isNotFindTracking && index == this.trips.length - 1) {
              this.errorMessage.set(this.translate.instant('noLocationFound'));
            }
          }
        })
    })
  }
  setMarker(map: Map,customMarker:Marker<any>, trip: any) {
    if (trip.currentLocation) {
      customMarker = marker(trip.currentLocation, {
        icon: icon({
          iconSize: [25, 25],
          iconAnchor: [15, 25],
          iconUrl: trip.isEnd ? '/images/Red-Bus.webp' : '/images/Green-Bus.webp',
        }),
      });

      const popup1 = popup({ autoClose: false, closeOnClick: false })
        .setContent(`
    <h3>${trip.name}</h3>
    <p>${this.translate.instant('bus')}: ${trip.busName}</p>
    ${!trip.isEnd ? `<p>${this.translate.instant('driverSpeed')}: ${trip.driver_speed}</p>` : ''}
    <p>${this.translate.instant('status')}: ${trip.isEnd ? this.translate.instant('offline') : this.translate.instant('online')}</p>
  `);

      customMarker.addTo(map).bindPopup(popup1);
    }
    return customMarker;
  }
  onFilterChange(key: string, value: string | number) {
    if (key == 'time') {
      this.toSchool .set(value == 'M');
      this.resetFilter()
    }
    this.removeMarkers();
    this.errorMessage.set('');
    (this.filter as any)[key] = value;
    this.getFilteringTracking();
  }
  getFilteringTracking() {
    this.trips.forEach((p, i) => {
      this.isTripMatchFilter(p) ? this.trips[i].isTrack = true : this.trips[i].isTrack = false;
    });
    this.getTracking(this.datePipe.transform(this.date,'dd-MM-yyyy')!);
  }
  isTripMatchFilter(trip:TTrip) {
    const locationMatch =
      this.filter.location === '' ||
      trip?.morning?.school_locationId === this.filter.location;

    const tripKey = this.toSchool() ? trip?.morning?.key ?? '' : trip?.evening?.key ?? '';
    const tripMatch =
      this.filter.trip === '' || tripKey === this.filter.trip;

    const hasTripKey = this.toSchool() ? trip?.morning?.key : trip?.evening?.key;

    const statusMatch =
      this.filter.status === -1 || trip.isEnd === !!this.filter.status;
    return locationMatch && tripMatch && hasTripKey && statusMatch;
  }
  resetFilter() {
    this.removeMarkers();
    this.filter = {
      trip: '',
      location: '',
      status: -1,
      time: 'M'
    };
    this.trips=this.trips.map(p => { return { ...p, isTrack: true } });
    this.getTracking(this.datePipe.transform(this.date,'dd-MM-yyyy')!);
  }
  ngOnDestroy(): void {
    this.$tracking.next();
    this.$tracking.complete();
  }
}
