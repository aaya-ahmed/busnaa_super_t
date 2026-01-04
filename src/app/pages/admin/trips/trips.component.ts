import { Component, OnInit, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { Subject, Observable, take } from "rxjs";
import { TripsService } from "../../../services/apis/trip.service";
import { SidemanagerService } from "../../../services/sidemanager.service";
import { MainListComponent } from "../../../shared/component/mainList/mainList.component";
import { actionsDto } from "../../../shared/model/List";
import { operationStatusEnum } from "../../../shared/model/operationStatus";
import { dataResponce } from "../../../shared/model/responce";
import { ITransferdTrip, ITripKeys } from "../../../shared/model/trip";
import { ToastService } from "../../../services/toast.service";
import { ConfirmService } from "../../../services/confirm.service";
import { ModelService } from "../../../services/model.service";
import { TripStudents } from "./trip-students/trip-students";
import { TripSupervisor } from "./trip-supervisor/trip-supervisor";
import { TripBus } from "./trip-bus/trip-bus";

@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  imports: [MatButtonModule, MatIconModule, TranslateModule, MainListComponent]
})
export class TripsComponent implements OnInit {
  actions: actionsDto<ITransferdTrip>[] = [];
  operationStatusChange: Subject<operationStatusEnum> = new Subject();
  service: () => Observable<dataResponce<ITransferdTrip>>;
  refresh = signal(false);
  constructor(private tripService: TripsService,
    public dialog: MatDialog,
    private sidebar: SidemanagerService,
    private toastr: ToastService,
    private translate: TranslateService,
    private modelService: ModelService,
    private confirmService: ConfirmService,
  ) {
    this.actions = [
      { tooltip: 'students', click: (item: ITransferdTrip) => this.showStudents(item), icon: 'person' },
      { tooltip: 'supervisor', click: (item: ITransferdTrip) => this.showSupervisors(item), icon: 'people' },
      { tooltip: 'bus', click: (item: ITransferdTrip) => this.showBus(item), icon: 'directions_bus' },
      { tooltip: 'users`Location', click: (item: ITransferdTrip) => this.showusersloctaion(item), icon: 'map' },
      { tooltip: 'edit', click: (item: ITransferdTrip) => this.editTrip(item), icon: 'edit' },
      { tooltip: 'delete', click: (item: ITransferdTrip) => this.deletetrip(item), icon: 'delete' },
    ]
    this.service = () => this.tripService.getTripsList();
  }
    ngOnInit(): void {
    this.sidebar._loader.subscribe({
      next:(loader)=>{
        if(loader.reLoad&&!loader.open){
          this.refreshList()
        }
      }
    })
  }
  addNew() {
    this.sidebar.load({ open: true, type: 'trip', data: signal(null) });
  }

  editTrip(_item: ITransferdTrip) {
    this.sidebar.load({ open: true, type: 'trip', data: signal(_item) });
  }

  deletetrip(trip: ITransferdTrip) {
    const dialogRef = this.confirmService.show({
      message: `${this.translate.instant('areYouSureYouWantToDelete')} ${trip.name}?`,
      yesText: this.translate.instant('delete'),
      noText: this.translate.instant('cancel')
    });
    console.log("trip to delete",trip)
    dialogRef.pipe(take(1)).subscribe(result => {
      if (result) {

        this.tripService.deleteTrip({morning:trip.morning?.key,evening:trip.evening?.key},trip.bus).pipe(take(1)).subscribe({
          next: () => {
            this.toastr.show('success', `${trip.name} ${this.translate.instant('hasBeenRemoved')}`);
            this.refreshList();
          },
          error: () => {
            this.toastr.show('error', `${this.translate.instant('thereAreWentWrong')}`);
          }
        })
      }
    });
  }

  showSupervisors(item: ITransferdTrip) {
    console.log(item)
    this.modelService.open(this.translate.instant('supervisor'), TripSupervisor, {
      tripKeys: {
        morning: item.morning?.supervisor,
        evening: item.evening?.supervisor
      } as ITripKeys
    })
  }

  showBus(data: ITransferdTrip) {
    this.modelService.open(this.translate.instant('bus'), TripBus, { busId: data.bus }, '350px')
  }

  showStudents(item: ITransferdTrip) {
    this.modelService.open(this.translate.instant('students'), TripStudents, {
      tripKeys: {
        morning: item.morning?.key,
        evening: item.evening?.key
      } as ITripKeys
    }, '350px')
  }
  showusersloctaion(trip: ITransferdTrip) {
    // this.dialog.open(UserlocationComponent, {
    //   data: { title: this.translate.instant("users`Location"), body: { tripId: trip.id, tripName: trip.name } }
    //   ,
    //   width: '800px'
    // });
  }
    refreshList() {
    this.refresh.set(true)
    setTimeout(() => {
      this.refresh.set(false)
    }, 1000);
  }
}
