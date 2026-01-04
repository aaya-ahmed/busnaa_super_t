import { Component, effect, input, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IPutStudentData, IStudent } from '../../../../shared/model/student';
import { PhonevalidationService } from '../../../../services/phonevalidation.service';
import { SidemanagerService } from '../../../../services/sidemanager.service';
import { SchoolService } from '../../../../services/apis/school.service';
import { ParentService } from '../../../../services/apis/parent.service';
import { TranslatePipe } from '@ngx-translate/core';
import { MatFormField, MatLabel, MatError } from "@angular/material/form-field";
import { form, Field, required, validate, customError } from '@angular/forms/signals';
import { userTypes } from '../../../../shared/consts/const';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { switchMap, take, throttleTime } from 'rxjs';
import { IParent } from '../../../../shared/model/parent';
import { MatInput } from '@angular/material/input';
import { MatAnchor } from "@angular/material/button";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { StudentLocationComponent } from "./student-location/student-location.component";
import { environment } from '../../../../../environments/environment';
import { StudentService } from '../../../../services/apis/student.service';
import { ConfirmService } from '../../../../services/confirm.service';
import { StudentParentService } from '../../../../services/apis/studentParent.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  templateUrl: './studentform.component.html',
  styleUrls: ['./studentform.component.scss', '../../../../../_form.scss'],
  standalone: true,
  imports: [TranslatePipe,
    MatInput,
    MatFormField,
    MatLabel,
    Field,
    MatProgressSpinner,
    ReactiveFormsModule,
    MatAnchor, MatError, MatSlideToggle, StudentLocationComponent]
})
export class StudentformComponent {
  data = input<IStudent | null>(null);
  studentForm = form(signal<Required<IPutStudentData>>({
    name: '',
    isBlocked: false,
    key: '',
    parent: '',
    schools: '0',
    type: userTypes.parent,
    address: '',
    addedDate: '',
    updatedDate: '',
    latlng: `${environment.fixedLocation[0]},${environment.fixedLocation[1]}`
  }),
    field => {
      required(field.name, { message: 'name is required' });
      validate(field.parent, (ctx) => {
        return this.phoneValidation.phoneValidator(ctx.value()) ? undefined :
          customError({ message: 'invalidphone', kind: 'invalidphone' });
      });
      validate(field.latlng, (ctx) => {
        const message = this.locationvalidator(ctx.value().split(','))
        return message == '' ? undefined :
          customError({ message: message, kind: 'invalidlocation' });

      })
    })
  searchCtrl: FormControl = new FormControl();
  parents: IParent[] = [];
  loadingParents = false;
  selectedParent: IParent | null = null;
  isNewParent: boolean = false;
  submitting = signal(false);
  disabledAllControl = signal(false);




  trips$: any
  trips: any
  newstudenttrips: any[] = []
  studenttrips: any[] = []
  constructor(
    private phoneValidation: PhonevalidationService,
    private sidebar: SidemanagerService,
    private parentService: ParentService,
    private stuentService: StudentService,
    private schoolService: SchoolService,
    private confirmService: ConfirmService,
    private studentParenService: StudentParentService,
    private toastService: ToastService
  ) {

    this.setInitialForm()
  }
  ngOnInit(): void {
    this.setSearching()
  }
  setInitialForm(){
        effect(() => {
      const initialData = this.data();
      untracked(() => {
        if (initialData?.key) {
          this.studentForm().setControlValue({
            ...this.studentForm().value(),
            updatedDate: new Date().toLocaleDateString(),
            address: initialData?.parentInfo.address ?? '',
            isBlocked: initialData?.parentInfo.isBlocked ?? false,
            latlng: initialData?.parentInfo.latlng ?? `${environment.fixedLocation[0]},${environment.fixedLocation[1]}`,
            key: initialData?.key ?? '',
            name: initialData?.name ?? '',
            parent: initialData?.parent ?? ''
          });
          this.chooseParent({ ...initialData?.parentInfo, phone: initialData?.parent, key: initialData?.parent } as IParent)
        }
        this.studentForm().setControlValue({
          ...this.studentForm().value(),
          schools: this.schoolService.getSchoolFromLocalStorage()?.key ?? '',
          type: userTypes.parent,
          addedDate:initialData?.key?initialData?.parentInfo.addedDate ?? '':(new Date()).toLocaleDateString(),
        });
      })
    })
  }
  setSearching() {
    this.searchCtrl.valueChanges.pipe(throttleTime(500)).subscribe(val => {
      this.parents = []
      if (val) {
        const parentPhone = parseInt(val).toString();
        this.loadingParents = true;
        this.parentService.getFristTenparentsList(parentPhone).subscribe(val => {
          this.parents = val.responce ?? [];
          this.loadingParents = false;
        });
      } else {
        this.loadingParents = false;
      }
    });
  }
  locationvalidator(latlng: string[]) {
    if (latlng.length == 2) {
      if (parseFloat(latlng[0]) > 90 || parseFloat(latlng[0]) < -90) {
        return "range of lat is (-90,90)"
      }
      else if (parseFloat(latlng[1]) > 180 || parseFloat(latlng[1]) < -180) {
        return "range of lng is (-180,180)"
      }
      else if (latlng[0].substring(latlng[0].indexOf('.') + 1).length < 4 || latlng[1].substring(latlng[1].indexOf('.') + 1).length < 4) {
        return "min lat or long fraction is 4 digit"
      }
      return ''
    }
    else {
      return "invalid, format must be (xx.xxxx,xx.xxxx)"
    }
  }
  setlatlng(event: string) {
    this.studentForm.latlng ? this.studentForm.latlng().setControlValue(event ?? '') : null;
  }

  setnewtrips() {
    // this.newstudenttrips = event
  }
  /*parent section */
  chooseParent(item: IParent | null) {
    console.log("item", item)
    if (item?.phone) {
      this.searchCtrl?.setValue("");
      this.selectedParent = item;
      this.isNewParent = false;
      this.studentForm().setControlValue({
        ...this.studentForm().value(),
        parent: this.selectedParent.phone,
        address: this.selectedParent.address ?? '',
        latlng: this.selectedParent.latlng ?? '',
        isBlocked: this.selectedParent.isBlocked ?? false
      });
    }
  }

  newParent() {
    this.isNewParent = true;
    this.selectedParent = null;
    this.setParent()
  }

  removeParent() {
    this.isNewParent = false;
    this.selectedParent = null;
    this.setParent();
  }

  setParent() {
    this.studentForm.parent().setControlValue(this.selectedParent?.phone ?? '');
    this.studentForm.address ? this.studentForm.address().setControlValue(this.selectedParent?.address ?? '') : null;
    this.studentForm.latlng ? this.studentForm.latlng().setControlValue(this.selectedParent?.latlng ?? '') : null;
    this.studentForm.isBlocked ? this.studentForm.isBlocked().setControlValue(this.selectedParent?.isBlocked ?? false) : null;

  }
  /*save form section */
  save() {
    if (this.data()?.key) {
      const data = this.studentForm().value();
      const oldPhone = this.data()?.parent;
      oldPhone && this.updateStudentUpdateParent(oldPhone, data);
    } else {
      this.addnew();
    }
  }
  /*save new student  */
  addnew() {
    this.submitting.set(true);
    try {
      //oldPhone is getting from search (selectedParent) or input data
      const oldParentPhone = this.selectedParent?.phone || this.data()?.parent;
      if (oldParentPhone) {
        this.addNewStudentUpdateParent(oldParentPhone);
        return;
      }
      this.addNewStudentNewParent()
    } catch (e) {
      this.submitting.set(false);
    }
  }
  addNewStudentNewParent() {
    if (this.isNewParent) {
      const data = this.studentForm().value()
      this.addParent(data).pipe(switchMap(() => {
        return this.addStudent(data)
      })).subscribe({
        next: () => this.sidebar.load({ data: {}, reLoad: true, open: false, type: '' }),
        error: (error) => this.toastService.show('error', error.error),
        complete: () => { this.submitting.set(false) }
      })
    }
  }
  addNewStudentUpdateParent(oldParentPhone: string) {
    const formData = this.studentForm().value();
    //phone=form.parent is new phone
    if (oldParentPhone != formData.parent) {
      const result = this.confirmService.show({ message: 'A parent is already associated with this phone number and has registered students. Do you want to delete the current parent and transfer the students to the new parent?' });
      result.pipe(take(1)).subscribe({
        next: removeParent => {
          this.studentParenService
            .updateparentPhone(oldParentPhone, {
              ...formData,
              name: formData.name,
              phone: formData.parent,
              key:formData.parent,
              isBlocked: formData.isBlocked ?? false,
              address: formData.address,
              latlng: formData.latlng
            }, !!removeParent).pipe(switchMap(() => {
              return this.stuentService.addStudent({
                name: formData.name,
                parent: formData.parent.toString(),
              })
            })).subscribe({
              next: () => this.sidebar.load({ data: {}, reLoad: true, open: false, type: '' }),
              error: (error) => this.toastService.show('error', error.error),
              complete: () => { this.submitting.set(false) }
            })

        }
      })
    } else {
      this.parentService
        .updateparent({
          ...formData,
          phone: formData.parent,
          isBlocked: formData.isBlocked ?? false,
          address: formData.address ?? '',
          latlng: formData.latlng ?? '',
          key: formData.parent
        }).pipe(switchMap(() => {
          return this.stuentService.addStudent({
            name: formData.name,
            parent: formData.parent
          })
        })).subscribe({
          next: () => this.sidebar.load({ data: {}, reLoad: true, open: false, type: '' }),
          error: (error) => this.toastService.show('error', error.error),
          complete: () => { this.submitting.set(false) }
        })
    }
  }

  /*update student  */
  updateStudentUpdateParent(oldPhone: string, data: IPutStudentData) {
    this.submitting.set(true)
    if (oldPhone == data.parent) {
      this.parentService.updateparent({
        ...data,
        key: data.parent,
        isBlocked: data.isBlocked ?? false,
        phone: data.parent,
        address: data.address ?? '',
        latlng: data.latlng ?? '',
      }).pipe(switchMap(() => this.stuentService.updateStudent({
        key: data.key,
        name: data.name,
        parent: data.parent,
      }))).subscribe({
        next: () => this.sidebar.load({ data: {}, reLoad: true, open: false, type: '' }),
        error: (error) => this.toastService.show('error', error.error),
        complete: () => { this.submitting.set(false) }
      })
    } else {
      const result = this.confirmService.show({ message: 'A parent is already associated with this phone number and has registered students. Do you want to delete the current parent and transfer the students to the new parent?' });
      result.pipe(take(1)).subscribe({
        next: responce => {
          console.log("responce", responce);
          this.studentParenService
            .updateparentPhone(oldPhone, {
              ...data,
              name: data.name,
              phone: data.parent,
              isBlocked: data.isBlocked ?? false,
              address: data.address ?? '',
              latlng: data.latlng ?? '',
            }, !!responce).pipe(switchMap(() => {
              return this.stuentService.updateStudent({
                key: data.key,
                name: data.name,
                parent: data.parent,
              })
            })).subscribe({
              next: () => this.sidebar.load({ data: {}, reLoad: true, open: false, type: '' }),
              error: (error) => this.toastService.show('error', error.error),
              complete: () => { this.submitting.set(false) }
            })
        }
      })
    }

  }
  addParent(data: IPutStudentData) {
    return this.parentService.addparent({
      ...data,
      phone: data.parent,
      isBlocked: data.isBlocked ?? false,
      address: data.address ?? '',
      latlng: data.latlng ?? ''
    })
  }
  addStudent(data: IPutStudentData) {
    return this.stuentService.addStudent({
      name: data.name,
      parent: data.parent,
    })
  }
  getParent(phone?: string) {
    // const phone = this.studentForm().value().parent;
    if (phone) {
      this.disabledAllControl.set(true);
      this.parentService.getparent(phone).pipe(take(1)).subscribe({
        next: (response) => {
          this.chooseParent(response?.responce);
        },
        error: (e) => {
          console.log("parent response");

        },
        complete: () => {
          this.disabledAllControl.set(false);
        }
      })
    }
  }

  setStusentTrips(key: any) {
    // this.newstudenttrips.forEach(ele => {
    //   let buskey = this.trips.find(p => p?.morning?.key == ele.trip || p?.evening?.key == ele.trip)?.bus;
    //   if (buskey) {
    //     if (ele.unassign == false) {
    //       this.ps.assignStudentToTrip(key, ele.trip);
    //       this.addparenttotripchatGroup(ele, buskey);
    //     }
    //     else {
    //       this.data.trip.splice(this.data.trip.findIndex(p => p.data.trip == ele.trip), 1);
    //       this.ps.unAssignStudentFromTrip(key, ele.trip);
    //       this.studenttrips.splice(this.studenttrips.findIndex(p => (ele.trip == p.key)), 1)
    //       this.deleteparentfromtripchat(buskey, ele.trip);
    //     }
    //   }
    // })
  }
  addparenttotripchatGroup() {
    // let index = this.trips.findIndex(p => (p?.morning?.key == trip.trip || p?.evening?.key == trip.trip))
    // if (index != -1) {
    //   let choosenTrip = this.trips[index].morning?.key == trip.trip ? this.trips[index]?.morning : this.trips[index]?.evening;
    //   if (choosenTrip)
    //     this.studenttrips.push(choosenTrip)
    // }
    // this.chatservice.setMemberToChatGroup(buskey, this.parentForm.value.phone ? parseInt(this.parentForm.value.phone).toString() : '')
  }
  deleteparentfromtripchat() {
    // if (this.studenttrips.findIndex(p => (p.data.bus == buskey)) == -1) {
    //   this.chatservice.deleteParentFromChatGroup(buskey, this.parentForm.value.phone ? parseInt(this.parentForm.value.phone).toString() : '', this.data.key, trip)
    // }
  }
  cancal() {
    this.sidebar.load({ open: false, type: 'student', reLoad: false, data: {} });
  }

}
