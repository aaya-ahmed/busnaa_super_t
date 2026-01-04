import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import { ConfirmComponent } from 'src/app/shared/component/modal/confirm/confirm.component';
// import { GeneralComponent } from 'src/app/shared/component/modal/general/general.component';
// import { ParentService } from 'src/app/shared/services/parent.service';
// import { SchoolService } from 'src/app/shared/services/school.service';
// import { SidemanagerService } from 'src/app/shared/services/sidemanager.service';
// import readXlsxFile from 'read-excel-file'
// import { ImporterComponent } from 'src/app/shared/component/modal/importer/importer.component';
import { debounceTime, distinctUntilChanged, map, take } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MainListComponent } from "../../../shared/component/mainList/mainList.component";
import { actionsDto } from '../../../shared/model/List';
import { operationStatusEnum } from '../../../shared/model/operationStatus';
import { SidemanagerService } from '../../../services/sidemanager.service';
import { dataResponce } from '../../../shared/model/responce';
import { ToastService } from '../../../services/toast.service';
import { IStudent } from '../../../shared/model/student';
import { StudentService } from '../../../services/apis/student.service';
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { ModelService } from '../../../services/model.service';
import { StudentTrips } from './student-trip/student-trip';
import { ExtraInfo } from './extra-info/extra-info';
import { ConfirmService } from '../../../services/confirm.service';
import { StudentParentService } from '../../../services/apis/studentParent.service';
// import { ChatService } from 'src/app/shared/services/chat.service';



@Component({
  selector: 'app-students',
  templateUrl: './students.html',
  styleUrls: [],
  imports: [TranslatePipe, MainListComponent, MatIcon, MatButtonModule]
})
export class StudentsComponent implements OnInit{
  actions: actionsDto<IStudent>[] = [];
  service: (startKey?: { value: string, key: string }, searchingKey?: 'name' | 'parent', searchingValue?: string) => Observable<dataResponce<IStudent>>;
  isProcessOpration = signal('');
  refresh = signal(false);
  constructor(
    private sidebar: SidemanagerService,
    private studentService: StudentService,
    private toastr: ToastService,
    private translate: TranslateService,
    private modelService: ModelService,
    private confirmService:ConfirmService,
    private toastService:ToastService,
    private studentParentService:StudentParentService
  ) {
    this.actions = [
      { tooltip: 'trips', click: (item: IStudent) => this.viewTrips(item), icon: 'directions_bus' },
      { tooltip: 'parent', click: (item: IStudent) => this.viewParent(item), icon: 'people', key: 'parent' },
      { tooltip: 'edit', click: (item: IStudent) => this.editStudent(item), icon: 'edit' },
      { tooltip: 'delete', click: (item: IStudent) => this.deleteStudent(item), icon: 'delete' }

    ]
    this.service = (startKey?: { value: string, key: string }, searchingKey?: 'name' | 'parent', searchingValue?: string) => this.studentParentService.getSearchedStudentsPaged(startKey, searchingKey, searchingValue);
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

  viewTrips(item: IStudent) {
    this.modelService.open('Student Trips', StudentTrips, {
      studentId: item.key
    })
  }

  editStudent(item?: IStudent) {
      this.sidebar.load({ open: true , type : 'student' , data : signal(item)});
  }

  deleteStudent(data: IStudent) {
    const dialogRef = this.confirmService.show({ message: `you will delete student ${data.name}\n Are you sure?` });
    dialogRef.pipe(take(1)).subscribe(result => {
      if (result) {
        this.isProcessOpration.set(data.key)
        this.studentService.deleteStudent(data.key).pipe(take(1)).subscribe({
          next: (res) => {
            res && this.toastService.show('success', 'student is deleted');
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
  viewParent(item: IStudent) {
    console.log(item)
    this.modelService.open('Assigned Parent', ExtraInfo, {
      parent: item.parentInfo
    })
  }


  chooseExcel(e: any) {
    //   readXlsxFile(e.target.files[0],{ sheet: 1 }).then((f_table) => {
    //     if(f_table.length > 1){
    //       const dialogRef = this.dialog.open(ImporterComponent, {
    //         data: {title: "Import Students", result : f_table}
    //       });
    //     }
    //   })
  }



  addNew() {
      this.sidebar.load({ open: true , type : 'student' , data : signal({})});
  }
    refreshList() {
    this.refresh.set(true)
    setTimeout(() => {
      this.refresh.set(false)
    }, 1000);
  }
}
