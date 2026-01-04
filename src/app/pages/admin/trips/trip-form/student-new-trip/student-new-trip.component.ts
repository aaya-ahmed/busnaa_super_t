import { Component, input, Input, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { StudentsService, studentTripType } from './students.service';
import { ChatServiceService } from '../chat-service.service';
import readXlsxFile from 'read-excel-file';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ParentService } from '../../../../../services/apis/parent.service';
import { SchoolService } from '../../../../../services/apis/school.service';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { catchError, debounceTime, filter, firstValueFrom, forkJoin, from, map, of, switchMap, take } from 'rxjs';
import { StudentService } from '../../../../../services/apis/student.service';
import { IPostStudentDataQuery, IStudent } from '../../../../../shared/model/student';
import { TripsService } from '../../../../../services/apis/trip.service';
import { StudentTripsService } from '../../../../../services/apis/student-trips.service';
import { ConfirmService } from '../../../../../services/confirm.service';
import { IPutParentData } from '../../../../../shared/model/parent';
import { userTypes } from '../../../../../shared/consts/const';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
@Component({
  selector: 'busnaa-student-new-trip',
  templateUrl: './student-new-trip.component.html',
  styleUrls: ['./student-new-trip.component.scss', '../../../../../../_form.scss'],
  standalone: true,
  imports: [MatFormField,
    MatOption,
    MatIcon,
    TranslatePipe,
    MatInput,
    MatButton,
    ReactiveFormsModule,
    MatProgressSpinner,
    MatLabel, MatAutocompleteModule, MatIconButton]
})
export class StudentNewTripComponent implements OnInit {
  isAdd = input(false);
  mode = input<'M' | 'E'>('E');
  morningTripId = input('');
  eveningTripId = input('');
  bus = input('')
  students = signal<IStudent[]>([]);
  studentsTrip = signal<studentTripType[]>([]);
  student: IStudent | null = null;
  student_ctrl: FormControl = new FormControl('');
  order_ctrl: FormControl = new FormControl('');
  excelSchema = {
    studentName: {
      column: 'studentName',
      type: String,
      required: true

    },
    parentPhone: {
      column: 'parentPhone',
      type: String,
      required: true

    },
    location: {
      column: 'location',
      type: String,
      required: true

    }
  } as const
  isLoading = false
  constructor(
    public dialog: MatDialog,
    private parentService: ParentService,
    private schoolService: SchoolService,
    private studentService: StudentsService,
    private studentApiService: StudentService,
    private chatService: ChatServiceService,
    private studentTripsService: StudentTripsService,
    private confirmService: ConfirmService
  ) { }

  ngOnInit(): void {
    if (this.isAdd()) {
      this.studentsTrip.set(this.studentService.initialList);
    }
    this.loadStudents();
    this.student_ctrl.valueChanges.pipe(debounceTime(500), filter(p => p != '')).subscribe({
      next: res => {
        if (typeof res == 'string')
          this.studentApiService.getStudentsByName(res)?.pipe(take(1)).subscribe((data) => {
            if (data.responce)
              this.students.set(data.responce);
          })
      }
    })
  }
  loadStudents() {
    this.studentsTrip.set([])
    this.studentApiService.getStudentsByTrip(this.mode() == 'M' ? this.morningTripId() : this.eveningTripId()).subscribe(data => {
      if (data && data.responce.length > 0) {
        const list: studentTripType[] = []
        for (let i = 0; i < data.responce.length; i++) {
          list.push({
            studentTripKey: data.responce[i].studentTripKey,
            studentKey: data.responce[i].key,
            name: data.responce[i].name,
            parent: data.responce[i].parent,
            mode: this.isAdd() && this.mode() == 'M' ? -1 : this.mode()
          });
        }
        this.studentsTrip.set(list)
      }
    });
  }

  clearStudentName() {
    this.student_ctrl.setValue('');
    this.students.set([]);
  }
  onStudentSelectionChanged($event: any): any {
    this.student = $event.option.value;
  }
  getTripsStudents() {
    // let tripsSubscriber = this.schoolService.getAllTrips().subscribe(tripData => {
    //   if (tripData && tripData.length) {
    //     let trips_list = [];
    //     if (this.mode == 'M')
    //       trips_list = tripData.filter((itm: any) => itm.key != this.morningTripId && itm.data.to_school);
    //     else if (this.mode == 'E')
    //       trips_list = tripData.filter((itm: any) => itm.key != this.eveningTripId && !itm.data.to_school);
    //     const dialogRef = this.dialog.open(TripsstudentsComponent, {
    //       data: { title: 'Choose Trip', data: trips_list }
    //     });

    //     dialogRef.afterClosed().subscribe(result => {
    //       if (result?.length > 3) {
    //         this.schoolService.getTripStudents(result).then(tripStudentData => {
    //           if (tripStudentData && tripStudentData.length > 0) {
    //             for (let i = 0; i < tripStudentData.length; i++) {
    //               if (tripStudentData[i].data && this.studentsTrip.findIndex(p => p.studentKey == tripStudentData[i].data.student) == -1) {
    //                 if (this.isAdd && this.mode == 'M') {
    //                   this.schoolService.setStudentTrip({ order: tripStudentData[i].data.order, student: tripStudentData[i].data.student, trip: this.morningTripId });
    //                   this.schoolService.setStudentTrip({ order: tripStudentData[i].data.order, student: tripStudentData[i].data.student, trip: this.eveningTripId });
    //                 }
    //                 else {
    //                   this.schoolService.setStudentTrip({ order: tripStudentData[i].data.order, student: tripStudentData[i].data.student, trip: this.mode == 'M' ? this.morningTripId : this.eveningTripId });
    //                 }

    //                 let subscriber = this.schoolService.getStudent(tripStudentData[i].data.student).subscribe((student: any) => {
    //                   this.chatService.addusertotripchat(this.bus, student.parent)
    //                   this.studentsTrip.push({
    //                     studentKey: tripStudentData[i].data.student,
    //                     name: student.name,
    //                     parent: student.parent,
    //                     mode: this.isAdd && this.mode == 'M' ? -1 : this.mode
    //                   });
    //                   subscriber.unsubscribe()
    //                 });
    //               }
    //             }
    //           }
    //         });
    //       }
    //       tripsSubscriber.unsubscribe();
    //     });
    //   }
    // }, err => {
    //   ;
    // });
  }
  addEvent() {
    if (this.student)
      this.addStudent(this.student, this.order_ctrl.value ? parseInt(this.order_ctrl.value) : this.studentsTrip().length + 1)
  }
  addStudent(student: IStudent, order: number) {
    if (this.studentsTrip().findIndex(p => p.name == student.name) == -1) {
      if (this.isAdd() && this.mode() == 'M') {
        if (this.morningTripId() && this.eveningTripId() && student) {
          forkJoin([
            this.studentTripsService.addStudentToTrip(student.key, this.morningTripId(), order),
            this.studentTripsService.addStudentToTrip(student.key, this.eveningTripId(), order)
          ])
            .subscribe({
              next: ([resmorning, resevening]) => this.studentsTrip.update(prev => [...prev,
              {
                studentTripKey: resmorning.responce ?? '',
                studentKey: student.key,
                name: student.name,
                parent: student.parent,
                mode: -1
              },
              {
                studentTripKey: resevening.responce ?? '',
                studentKey: student.key,
                name: student.name,
                parent: student.parent,
                mode: -1
              }

              ]

              )
            });
        }
      }
      else {
        this.studentTripsService.addStudentToTrip(student.key,
          this.mode() == 'M' ? this.morningTripId() : this.eveningTripId(), order).subscribe(
            {
              next: (res) => this.studentsTrip.update(prev => [...prev,
              {
                studentTripKey: res.responce ?? '',
                studentKey: student.key,
                name: student.name,
                parent: student.parent,
                mode: this.mode()
              }])
            }
          )
      }
      this.chatService.addusertotripchat(this.bus(), student.parent)
      this.clearStudentName()
      this.order_ctrl.setValue('');
    }
  }
  deleteStudent(index: number, item: studentTripType) {
    if (item.studentKey) {
      const dialogRef = this.confirmService.show({
        message: 'Are you sure?'
      })
      const subscriber = dialogRef.subscribe(async result => {
        if (result) {
          const list = [...this.studentsTrip()]
          if (this.isAdd() && this.mode() == 'M') {
            if (this.morningTripId() && this.eveningTripId()) {
              const keys = list.filter(p => p.name == item.name).map(p => p.studentTripKey);
              this.studentTripsService.deleteStudentFromTrip(keys[0]);
              this.studentTripsService.deleteStudentFromTrip(keys[1]);
              list.splice(index, 1);

            }
          }
          else {
            this.studentTripsService.deleteStudentFromTrip(item.studentTripKey);
            list[index].mode == -1 ?
              list[index].mode = this.mode() == 'M' ? 'E' : 'M' :
              list.splice(index, 1)
          }
          item.parent && this.chatService.deleteusertotripchat(this.bus(), item.parent);
          this.studentsTrip.set(list)
        }
        subscriber.unsubscribe()
      });
    }

  }

  onFileSelected(event: any) {
    this.isLoading = true;
    if (event.target.files[0])
      readXlsxFile(event.target.files[0], { schema: this.excelSchema }).then((table) => {
        if (table.errors.length > 0) {
          this.isLoading = false;
          return;
        }
        if (table.rows.length > 0) {
          this.processRowsSequentially(table.rows as any);
        } else {
          this.isLoading = false;
        }
      }).catch(error => {
        this.isLoading = false;
      });
  }
  private processRowsSequentially(rows: { studentName: string, parentPhone: string, location: string }[]) {
    let currentIndex = 0;

    const processNextRow = () => {
      if (currentIndex >= rows.length) {
        this.isLoading = false;
        return;
      }

      const item = rows[currentIndex];
      currentIndex++;

      this.processRow(item).pipe(
        take(1)
      ).subscribe({
        next: () => {
          setTimeout(() => processNextRow(), 10);
        },
        error: (error) => {
          setTimeout(() => processNextRow(), 10);
        }
      });
    };

    processNextRow();
  }
  private processRow(item: { studentName: string, parentPhone: string, location: string }) {
    return this.parentService.getparent(item.parentPhone).pipe(
      switchMap((parent) => {
        if (parent?.responce) {
          const parentObj: Required<IPutParentData> = {
            ...parent.responce as Required<IPutParentData>,
            name: item.studentName,
            phone: parent?.responce?.phone,
            latlng: (this.getlocation(item.location as string) || parent?.responce?.latlng) ?? '',
          }
          this.parentService.updateparent(parentObj).pipe(take(1)).subscribe()
          return this.studentApiService.getStudentByPhone(item.parentPhone as string);
        } else {
          this.parentService.addparent({
            name: item.studentName,
            phone: parseInt(item.parentPhone as string).toString(),
            addedDate: new Date().toLocaleString(),
            latlng: this.getlocation(item.location as string) || '',
            address: '',
            isBlocked: false,
            schools: this.schoolService.getSchoolFromLocalStorage()?.key || '',
            type: userTypes.parent,
          }).subscribe()
          return of({ responce: [], error: null })
        }
      }),
      switchMap(students => {
        if (students.responce && students.responce.length > 0) {
          let index = students.responce?.findIndex(p => p.name == item.studentName);
          if (index != -1) {
            const student = students.responce[index];
            if (!this.isAdd) {
              return this.studentTripsService.getStudentTrips(student.key).pipe(
                map(trips => {
                  return { student, trips: trips.responce }
                })
              );
            }
            return of({ student: student, trips: [] });
          }
        }
        const student: IPostStudentDataQuery = {
          name: item.studentName,
          parent: item.parentPhone ? parseInt(item.parentPhone as string).toString() : ''
        }
        return firstValueFrom(
          this.studentApiService.addStudent(student)).then(data => {
            return { student: { key: data.responce, ...student }, trips: [] };
          })
      }),
      switchMap(({ student, trips }) => {
        if (student && trips) {
          let tripIndex = trips.findIndex(p =>
            this.morningTripId() == p.key || this.eveningTripId() == p.key
          );
          if (tripIndex == -1) {
            this.addStudent(student as IStudent, 0);
          }
        }
        return of(null);
      }),
      catchError(error => {
        return of(null);
      })
    );
  }
  getlocation(url: string) {
    const regex = /@?([-0-9.]+),([-0-9.]+)/;
    const match = url.match(regex);
    if (match) {
      const lat = match[1];
      const lng = match[2];
      return `${lat},${lng}`;
    }
    return null;

  }
}
