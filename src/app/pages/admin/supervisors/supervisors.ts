import { Component, DestroyRef, signal } from '@angular/core';
import { SidemanagerService } from '../../../services/sidemanager.service';
import { SupervisorService } from '../../../services/apis/supervisor.service';
import { Isupervisor } from '../../../shared/model/supervisor';
import { ToastService } from '../../../services/toast.service';
import { ConfirmService } from '../../../services/confirm.service';
import { Observable, take } from 'rxjs';
import { actionsDto } from '../../../shared/model/List';
import { dataResponce } from '../../../shared/model/responce';
import { MainListComponent } from "../../../shared/component/mainList/mainList.component";
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { SupervisorTrip } from "./supervisor-trip/supervisor-trip";
import { ModelService } from '../../../services/model.service';
import { ExtraInfo } from './extra-info/extra-info';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'busnaa-supervisors',
  templateUrl: './supervisors.html',
  standalone: true,
  imports: [MainListComponent, TranslatePipe, MatIcon, MatButton]
})
export class SupervisorsComponent {
  isProcessOpration = signal('');
  refresh = signal(false);
  actions: actionsDto<Isupervisor>[] = [];
  service: (page: number) => Observable<dataResponce<Isupervisor>>;
  constructor(
    private confirmService: ConfirmService,
    private superviorService: SupervisorService,
    private toastService: ToastService,
    private modelService: ModelService,
    private sidebar: SidemanagerService) {
    this.actions = [
      { tooltip: 'toggle', click: (item: Isupervisor) => this.setblockedState(item), icon: 'toggle', check: 'isBlocked' },
      { tooltip: 'trips', click: (item: Isupervisor) => this.showSupervisorTrips(item), icon: 'directions_bus' },
      { tooltip: 'extra info', click: (item: Isupervisor) => this.showSupervisor(item), icon: 'people' },
      { tooltip: 'edit', click: (item: Isupervisor) => this.editSupervisor(item), icon: 'edit' },
      { tooltip: 'delete', click: (item: Isupervisor) => this.deleteSupervisor(item), icon: 'delete' }
    ]
    this.service = () => this.superviorService.getSupervisors();
    this.sidebar._loader.pipe(takeUntilDestroyed()).subscribe({
      next: res => {
        if (!res.open && res.reLoad) {
          this.refreshList()
        }
      }
    })
  }

  editSupervisor(_item: Isupervisor) {
    this.sidebar.load({ open: true, type: 'supervisor', data: signal(_item) });
  }

  deleteSupervisor(data: Isupervisor) {
    const dialogRef = this.confirmService.show({ message: 'Are you sure?' });
    dialogRef.pipe(take(1)).subscribe(result => {
      if (result) {
        this.isProcessOpration.set(data.key)
        this.superviorService.deleteSupervisor(data.key).pipe(take(1)).subscribe({
          next: (res) => {
            res && this.toastService.show('success', 'supervisor is deleted');
            this.refreshList()
          },
          error: (e) => {
            this.toastService.show('error', e);
          },
          complete: () => {
            this.isProcessOpration.set('')
          }
        })
      }
    });
  }

  addNew() {
    this.sidebar.load({ open: true, type: 'supervisor', data: signal({}) });
  }
  showSupervisor(supervisor: Isupervisor) {
    this.modelService.open("Extra Info", ExtraInfo, { supervisor: supervisor }, '300px')

  }
  showSupervisorTrips(supervisor: Isupervisor) {
    this.modelService.open("Supervisor Trips", SupervisorTrip, { supervisorId: supervisor.key })
  }

  setblockedState(item: Isupervisor) {
    this.isProcessOpration.set(item.key);
    const isBlocked = !!!item.isBlocked;
    this.superviorService.updateSupervisor({  ...item,key: item.key, isBlocked: isBlocked }).subscribe({
      next: () => { },
      error: () => {
        item.isBlocked = !item.isBlocked;
      },
      complete: () => {
        this.isProcessOpration.set('');
      }
    })
  }
  refreshList() {
    this.refresh.set(true)
    setTimeout(() => {
      this.refresh.set(false)
    }, 1000);
  }
}
