import { Component, input, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AdditionalSupervisorService } from './additional-supervisor.service';
import { ChatServiceService } from '../chat-service.service';
import { SchoolService } from '../../../../../services/apis/school.service';
import { SupervisorService } from '../../../../../services/apis/supervisor.service';
import { MatFormField } from "@angular/material/form-field";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatIcon } from "@angular/material/icon";
import { TranslatePipe } from '@ngx-translate/core';
import { take } from 'rxjs';
import { Isupervisor, ISupervisorData } from '../../../../../shared/model/supervisor';
import { TripsService } from '../../../../../services/apis/trip.service';
import { ConfirmService } from '../../../../../services/confirm.service';
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'busnaa-additional-supervisor',
  templateUrl: './additional-supervisor.component.html',
  imports: [MatFormField, MatSelect, MatOption, MatIcon, TranslatePipe, ReactiveFormsModule, MatButtonModule],
  standalone: true,
  styleUrls:['./additional-supervisor.component.scss','../../../../../../_form.scss']
})
export class AdditionalSupervisorComponent implements OnInit, OnDestroy {
  isAdd = input(false);
  mode = input<'M' | 'E'>('E');
  morningTripId = input('');
  eveningTripId = input('');
  bus = input('')
  additionalSupervisorsList = signal<{
    name:string,
    key:string,
    mode:'M'|'E'|-1
  }[]>([]);
  supervisor_ctrl: FormControl = new FormControl('');
  supervisorsList = signal<Isupervisor[]>([]);
  exSupervidorId = 0
  constructor(
    private userService: SupervisorService,
    private schoolService: SchoolService,
    private additionalSupervisorService: AdditionalSupervisorService,
    private chatService: ChatServiceService,
    private tripService:TripsService,
    private confirmService:ConfirmService
  ) {
  }


  ngOnInit(): void {
    if (this.isAdd()) {
      this.additionalSupervisorsList.set(this.additionalSupervisorService.initialList);
    }
    this.userService.getSupervisors().pipe(take(1)).subscribe(spv => {
      if (spv && spv.responce.length > 0) {
        this.supervisorsList.set(spv.responce);
      }
    });
    if (this.morningTripId() || this.eveningTripId())
      this.loadAdditionalSupervisors()
  }
  onExSupervisorSelectionChanged() {
    this.addAdditionalSupervisor()
  }
  clearAdditionalSupervisor() {
    this.supervisor_ctrl.setValue('');
  }
  get supervisorId() {
    return this.supervisor_ctrl.value.key;
  }
  addAdditionalSupervisor() {
    if (this.additionalSupervisorsList().findIndex(p => p.key == this.supervisorId) == -1) {
      if (this.isAdd() && this.mode() == 'M') {
        this.tripService.setTripExSupervisor( this.morningTripId(),this.supervisorId);
        this.tripService.setTripExSupervisor(this.eveningTripId(),this.supervisorId);
      } else {
        this.tripService.setTripExSupervisor(this.mode() == 'M' ? this.morningTripId() : this.eveningTripId(), this.supervisorId);
      }
      this.additionalSupervisorsList.update(prev=>[...prev,
        {
        key: this.supervisorId,
        name: this.supervisor_ctrl.value.name,
        mode: this.isAdd() && this.mode() == 'M' ? -1 : this.mode()
      }
      ]);

      this.chatService.addusertotripchat(this.bus(), this.supervisorId)
      this.supervisor_ctrl.setValue('');
    }
  }

  deleteExSupervisor(index: number, item: {
    name:string,
    key:string,
    mode:'M'|'E'|-1
  }) {
    if (item.key) {
      const dialog=this.confirmService.show({
        message:'Are you sure?'
      })
      dialog.subscribe(async result => {
        if (result) {
          const list=[...this.additionalSupervisorsList()];
          if (this.isAdd() && this.mode() == 'M') {
            await this.tripService.removeExSupervisorTrip(this.morningTripId(), item.key)
            await this.tripService.removeExSupervisorTrip(this.eveningTripId(), item.key)
            list.splice(index, 1);
          } else {
            await this.tripService.removeExSupervisorTrip(this.mode() == 'M' ? this.morningTripId() : this.eveningTripId(), item.key)
            list[index].mode==-1?
            list[index].mode=this.mode() == 'M'?'E':'M':
            list.splice(index, 1)
          }
          this.additionalSupervisorsList.set(list);
          this.chatService.deleteSubervisorFromTripChat(this.bus(), item.key)
        }
      });
    }

  }
  loadAdditionalSupervisors() {
    this.additionalSupervisorsList.set([]);
    this.tripService.getAdditionalSupervisorForTrip(this.mode() == 'M' ? this.morningTripId() : this.eveningTripId()).subscribe(data => {
      if (data.responce) {
        const dataRes=Object.keys(data.responce);
        if (dataRes && dataRes.length > 0) {
          for (let i = 0; i < dataRes.length; i++) {
            this.getSupervisorData(dataRes[i]);
          }
        }
      }
    });
  }
  getSupervisorData(key: string) {
    this.userService.getSupervisor(key).subscribe((item) => {
      if (item.responce?.name) {
        if (this.additionalSupervisorsList().findIndex(p => p.key == key) == -1) {
          this.additionalSupervisorsList.update(prev => ([...prev, {
            name:item.responce?.name??"",
            key: item.responce?.key??"",
            mode: this.mode()
          }]))
        }
      }
    });
  }
  ngOnDestroy(): void {
    this.additionalSupervisorService.initialList=[];
  }
}
