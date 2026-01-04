import { Component, computed, effect, input, OnDestroy, OnInit, signal, untracked, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { switchMap, take } from 'rxjs/operators';
import { ChatServiceService } from './chat-service.service';
import { MatStepper, MatStep, MatStepperNext, MatStepperPrevious } from '@angular/material/stepper';
import { IPutTripData, ITransferdTrip } from '../../../../shared/model/trip';
import { SchoolService } from '../../../../services/apis/school.service';
import { BusService } from '../../../../services/apis/bus.service';
import { SupervisorService } from '../../../../services/apis/supervisor.service';
import { Isupervisor } from '../../../../shared/model/supervisor';
import { SchoolLocationService } from '../../../../services/apis/schoolLocation.service';
import { IschoolLocation } from '../../../../shared/model/schoolLocation';
import { TripsService } from '../../../../services/apis/trip.service';
import { TranslatePipe } from '@ngx-translate/core';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelect, MatOption } from "@angular/material/select";
import { AdditionalSupervisorComponent } from './additional-supervisor/additional-supervisor.component';
import { StudentNewTripComponent } from './student-new-trip/student-new-trip.component';
import { form, required, Field } from '@angular/forms/signals';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { firstValueFrom, of } from 'rxjs';
type mainFormType = {
  name: string;
  bus: string;
  busName: string;
  onlyAdmin: boolean;
}
@Component({
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.scss', '../../../../../_form.scss'],
  imports: [TranslatePipe,
    MatFormField,
    MatInputModule,
    MatButton,
    MatLabel,
    MatSlideToggle,
    MatProgressSpinner,
    MatTabsModule,
    MatSelect,
    MatOption,
    AdditionalSupervisorComponent,
    StudentNewTripComponent,
    Field, MatStep, MatStepper, MatStepperNext, MatStepperPrevious]
})
export class TripformComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') private stepper!: MatStepper;
  schoolId = 0;
  students = [];
  bus = ''
  isCompleted = false;
  mode: 'M' | 'E' = 'M';
  morningOldSupervisor = '';
  eveningOldSupervisor = '';

  data = input<ITransferdTrip | null>(null);
  mainForm = form(signal<mainFormType>({
    name: '',
    bus: '',
    busName: '',
    onlyAdmin: false

  }), (field) => {
    required(field.name),
      required(field.busName)
  })
  moriningDataForm = form(
    signal<IPutTripData>({
      key: '',
      start: '',
      end: '',
      supervisor: '',
      to_school: true,
      school_locationId: '',
      bus: '',
      name: '',
      status: 2
    }),
    (field) => ({
      start: required(field.start),
      end: required(field.end),
      supervisor: required(field.supervisor),
      school_locationId: required(field.school_locationId),
    })
  );
  eveningDataForm = form(
    signal<IPutTripData>({
      key: '',
      start: '',
      end: '',
      supervisor: '',
      to_school: false,
      name: '',
      bus: '',
      school_locationId: '',
      status: 2
    }),
    (field) => ({
      start: required(field.start),
      end: required(field.end),
      supervisor: required(field.supervisor),
    })
  );
  supervisorsLoaded = signal(false);
  supervisors = signal<Isupervisor[]>([]);
  locations = signal<IschoolLocation[]>([]);
  isAdd = signal(true);
  isFirst = signal(true);
  mainSubmitting = signal(false);
  morningSubmitting = signal(false);
  eveningSubmitting = signal(false);
  lastStep = signal<{ type: 'M' | 'E', isMorningLast: boolean, isEveningLast: Boolean }>(
    { type: 'M', isMorningLast: false, isEveningLast: false }
  )
  morningKey=computed(()=>this.moriningDataForm().value().key??'')
  eveningKey=computed(()=>{
    console.log("even",this.eveningDataForm().value().key)
    return this.eveningDataForm().value().key??""})
  isReady = signal(false)
  constructor(public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private schoolService: SchoolService,
    private supervisorService: SupervisorService,
    private busService: BusService,
    private schoolLocationService: SchoolLocationService,
    private tripService: TripsService,
    private chatservice: ChatServiceService) {
    effect(() => {
      const isTripExist = this.data()?.morning?.key && this.data()?.evening?.key
      const data = this.data()
      untracked(() => {
        if (isTripExist) {
          this.isCompleted = true
          this.isAdd.set(false);
          this.setMainData();
          this.setMorningData(data);
          this.setEveningData(data)
        }
      })
      this.isReady.set(true)
    })
  }
  get schoolLocationId() {
    return this.moriningDataForm.school_locationId().value()
  }

  ngOnInit(): void {
    this.schoolId = +(this.schoolService.getSchoolFromLocalStorage()?.key || '0');
    this.getSupervisors();
    this.getLocations();

  }
  setMainData() {
    this.mainForm().setControlValue({
      name: this.data()?.name ?? '',
      bus: this.data()?.bus ?? '',
      busName: '',
      onlyAdmin: false

    })
    this.bus = this.data()?.bus ?? ''
    this.getBus();
  }
  setMorningData(data: ITransferdTrip | null) {
    this.moriningDataForm().setControlValue({
      key: data?.morning?.key ?? '',
      start: data?.morning?.start ?? "",
      end: data?.morning?.end ?? "",
      supervisor: data?.morning?.supervisor ?? "",
      school_locationId: data?.morning?.school_locationId || '',
      to_school: true,
      name: this.data()?.name ?? '',
      bus: this.data()?.bus ?? '',
      status: data?.morning?.status
    })
    this.morningOldSupervisor = data?.morning?.supervisor ?? '';
  }
  setEveningData(data: ITransferdTrip | null) {
    console.log(data)
    this.eveningDataForm().setControlValue({
      key: data?.evening?.key ?? '',
      start: data?.evening?.start ?? "",
      end: data?.evening?.end ?? "",
      supervisor: data?.evening?.supervisor ?? "",
      to_school: false,
      name: data?.name ?? '',
      bus: data?.bus ?? '',
      school_locationId: data?.evening?.school_locationId || '',
      status: data?.evening.status,
    })
    this.eveningOldSupervisor = data?.evening?.supervisor ?? ''
  }
  getBus() {
    this.busService.getBus(this.data()?.bus ?? '').subscribe(bus => {
      if (bus.responce) {
        this.mainForm().setControlValue({
          ...this.mainForm().value(),
          busName: bus.responce.name ?? '',
          onlyAdmin: bus.responce.admin_only_chat ?? false
        });
      }
    })
  }
  getSupervisors() {
    this.supervisorService.getSupervisors().pipe(take(1)).subscribe(spv => {
      this.supervisorsLoaded.set(true);
      if (spv && spv.responce.length > 0) {
        this.supervisors.set(spv.responce.filter((item: any) => item.schools == this.schoolId));
      }
    });
  }
  getLocations() {
    this.schoolLocationService.getSchoolLocations().pipe(take(1)).subscribe(data => {
      if (data) {
        this.locations.set(data.responce ?? []);
      }
    });
  }

  //main data op
  async saveMainData() {
    if (this.mainForm().valid()) {
      this.mainSubmitting.set(true)
      const mainFormValue = this.mainForm().value();
      const morningValue = this.moriningDataForm().value();
      const eveningValue = this.eveningDataForm().value();

      if (!(eveningValue.key && morningValue.key)) {
        const morningId = await this.AddMainTrip(mainFormValue, true)
        const eveningId = await this.AddMainTrip(mainFormValue, false)
        console.log("Ids",morningId,eveningId)
        if (morningId && eveningId) {
          this.moriningDataForm().setControlValue({
            ...morningValue,
            ...mainFormValue,
            key: morningId
          })
          this.eveningDataForm().setControlValue({
            ...eveningValue,
            ...mainFormValue,
            key: eveningId
          })
          this.print()

          Promise.resolve().then(() => this.stepper.selectedIndex = 1);
        }

      } else if (!eveningValue.key) {
        const eveningId = await this.AddMainTrip(mainFormValue, false)
        this.eveningDataForm().setControlValue({
          ...eveningValue,
          ...mainFormValue,
          key: eveningId
        })
      }
      else if (!morningValue.key) {
        const morningId = await this.AddMainTrip(mainFormValue, true)
        this.moriningDataForm().setControlValue({
          ...morningValue,
          ...mainFormValue,
          key: morningId
        })
      } else {
        console.log("mainFormValue", mainFormValue);
        console.log("morningValue", morningValue);
        console.log("eveningValue", eveningValue);
        this.updateMainTrip(morningValue.key, mainFormValue);
        this.updateMainTrip(eveningValue.key, mainFormValue);
      }
      this.mainSubmitting.set(true)
    }
  }
  async AddMainTrip(form: mainFormType, toSchool: boolean) {
    let trip;
    if (form) {
      this.bus = form.bus;
      if (!form.bus) {
        this.bus = (await firstValueFrom(this.busService.addBus({ name: form.busName, admin_only_chat: form.onlyAdmin }))).responce ?? '';
        console.log("Created Bus ID:", this.bus);
        if (this.bus) {
          this.chatservice.addChatGroup(this.bus, {
            info: {
              name: form.busName,
              admin_only_chat: form.onlyAdmin,
              schoolId: this.schoolId
            }
          });
          this.mainForm().setControlValue({
            ...this.mainForm().value(),
            bus: this.bus
          });
        } else {
          return ''
        }
      }
      form.bus = this.bus;
      trip = await firstValueFrom(this.tripService.addTrip({
        bus: form.bus,
        name: form.name,
        end: '',
        school_locationId: '',
        start: '',
        supervisor: '',
        to_school: toSchool,
        status: 2
      }))
    }
    return trip?.responce ?? ''
  }
  updateMainTrip(tripKey: string, form: mainFormType) {
    this.busService.updateBus({ name: form.busName, key: form.bus, admin_only_chat: form.onlyAdmin }).pipe(
      switchMap(() => this.tripService.updateTrips({
        key: tripKey,
        bus: form.bus,
        name: form.name,
      })),
      switchMap(() => this.chatservice.updateChatGroup({
        key: form.bus,
        info: {
          name: form.busName,
          admin_only_chat: form.onlyAdmin,
          schoolId: this.schoolId
        }
      }))
    ).subscribe()
  }
  //morning&evening trip op
  updateMorningTrip() {
    console.log("stepper",this.stepper._steps.get(3))
    if (this.moriningDataForm().valid()) {
      this.morningSubmitting.set(true);
      const morningData = this.moriningDataForm().value();
      const eveningData = this.eveningDataForm().value();
      this.updateTrip(morningData, this.morningOldSupervisor).pipe(
        switchMap(() => {
          if (this.isAdd() && this.isFirst()) {
            this.isFirst.set(false);
            this.eveningDataForm().setControlValue({
              ...eveningData,
              start: morningData.end,
              end: morningData.start,
              supervisor: morningData.supervisor,
            })
            this.isCompleted = true;
            return this.updateTrip(this.eveningDataForm().value(), this.eveningOldSupervisor)
          }
          return of({
            responce:null,
            erorr:null
          })
        })
      ).subscribe({
        // next:()=>this.stepper._steps.get(3)?.select(),
        error: () => { },
        complete: () => this.morningSubmitting.set(false)
      })
    }
  }
  print(){
    console.log("")
      console.log("eveningdata",this.eveningDataForm().value())

  }
  updateEveningTrip() {
    console.log(this.eveningDataForm().valid())
    if (this.eveningDataForm().valid()) {
      this.eveningSubmitting.set(true)
      this.updateTrip(this.eveningDataForm().value()).subscribe();
    }
  }
  updateTrip(form: IPutTripData, oldSupervisor?: string) {
    if ((form.supervisor != oldSupervisor)&&oldSupervisor != '') {
      // this.chatservice.deleteSubervisorFromTripChat(this.mainForm.value.bus, form.value.oldSupervisor)
      //   this.chatservice.addusertotripchat(this.mainForm.value.bus, parseInt(form.value.supervisor).toString());
    }
    console.log("form",form)
    return this.tripService.updateTrips(form)
  }
  onStepChange(event: any) {
    if (event.selectedIndex === 1 && !(this.eveningKey() && this.morningKey())) {
      Promise.resolve().then(() => this.stepper.selectedIndex = 0);
    }

  }
  setLastStep(event: any, type: 'M' | 'E' | '', tabEvent?: any) {
    if (tabEvent) {
      this.lastStep.set({
        type: tabEvent.index == 0 ? 'M' : 'E',
        isMorningLast: event == null ? this.lastStep().isMorningLast : event.selectedStep.label === 'map',
        isEveningLast: event == null ? this.lastStep().isEveningLast : event.selectedStep.label === 'map'
      })
      return;
    }
    this.lastStep.set({
      type: type || 'M',
      isMorningLast: event.selectedStep.label === 'map',
      isEveningLast: event.selectedStep.label === 'map'
    })
  }
  ngOnDestroy(): void {
    if (!this.isCompleted) {
      (this.eveningKey() && this.morningKey()) && this.tripService.deleteTrip({ evening: this.eveningKey()??'', morning: this.morningKey()??'' }, this.mainForm().value().bus)
      this.mainForm()?.value()?.bus && this.busService.deleteBus(this.mainForm().value().bus);
      this.mainForm()?.value()?.bus && this.chatservice.deleteChatGroup(this.mainForm().value().bus);
    }
  }
}
