import { Component,signal } from "@angular/core";
import { Observable, take } from "rxjs";
import { SchoolLocationService } from "../../../services/apis/schoolLocation.service";
import { ConfirmService } from "../../../services/confirm.service";
import { SidemanagerService } from "../../../services/sidemanager.service";
import { ToastService } from "../../../services/toast.service";
import { actionsDto } from "../../../shared/model/List";
import { dataResponce } from "../../../shared/model/responce";
import { IschoolLocation } from "../../../shared/model/schoolLocation";
import { MainListComponent } from "../../../shared/component/mainList/mainList.component";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { TranslatePipe } from "@ngx-translate/core";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-schoolsLocation',
  templateUrl: './schoolsLocation.html',
  imports: [MainListComponent,TranslatePipe,MatIcon,MatButton],
})
export class SchoolsLocationComponent {
  isProcessOpration = signal('');
  supervisors = signal<IschoolLocation[]>([]);
  actions: actionsDto<IschoolLocation>[] = [];
  service: (page: number) => Observable<dataResponce<IschoolLocation>>;
    refresh = signal(false);


  constructor(
    private confirmService: ConfirmService,
    private schoolLocationService: SchoolLocationService,
    private sidebar: SidemanagerService) {
    this.actions = [
      { tooltip: 'edit', click: (item: IschoolLocation) => this.editLocation(item), icon: 'edit' },
      { tooltip: 'delete', click: (item: IschoolLocation) => this.deleteLocation(item), icon: 'delete' }
    ]
    this.service = () => this.schoolLocationService.getSchoolLocations();
    this.sidebar._loader.pipe(takeUntilDestroyed()).subscribe({
      next: res => {
        if (!res.open && res.reLoad) {
          this.refreshList()
        }
      }
    })
  }

  editLocation($loctaion: IschoolLocation) {
    this.sidebar.load({ open: true, type: 'location', data: signal($loctaion) });
  }

  deleteLocation($loctaion: IschoolLocation) {
    const dialogRef = this.confirmService.show({
      message: 'Are you sure?'
    });
    dialogRef.pipe(take(1)).subscribe(result => {
      if (result) {
        this.isProcessOpration.set($loctaion.key)
        this.schoolLocationService.deleteSchoolLocation($loctaion.key).subscribe({
          next:()=>this.refreshList(),
          complete: () => {
            this.isProcessOpration.set('')
          }
        })
      }
    });
  }

  addNew() {
    this.sidebar.load({ open: true, type: 'location', data: signal({}) });
  }
  refreshList() {
    this.refresh.set(true)
    setTimeout(() => {
      this.refresh.set(false)
    }, 1000);
  }
}
