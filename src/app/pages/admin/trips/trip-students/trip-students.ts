import { Component, effect, input, signal, untracked, WritableSignal } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { TranslatePipe } from '@ngx-translate/core';
import { MatTooltip } from "@angular/material/tooltip";
import { NgStyle } from '@angular/common';
import { IParentData } from '../../../../shared/model/parent';
import { ITripKeys } from '../../../../shared/model/trip';
import { MatRadioModule } from '@angular/material/radio';
import { StudentService } from '../../../../services/apis/student.service';
import { IStudent } from '../../../../shared/model/student';
import { Spinner } from "../../../../shared/component/spinner/spinner";
import { take } from 'rxjs';


@Component({
  selector: 'busnaa-trip-students',
  imports: [MatRadioModule, TranslatePipe, Spinner],
  templateUrl: './trip-students.html',
  styleUrl: './trip-students.scss',
})
export class TripStudents {
  tripKeys = input<ITripKeys | null>();
  students:WritableSignal<IStudent[]> =signal([])
  isMorning=true;
  isLoading= signal(false);
  constructor(private studentService: StudentService) {
    effect(() => {
      const keys = this.tripKeys();
      untracked(() => {
        if (keys?.morning || keys?.evening)
          this.getStudents(keys.morning || keys.evening);
      })
    })
  }
  getStudents(tripId: string) {
    this.isLoading.set(true);
    this.studentService.getStudentsByTrip(tripId).pipe(take(1)).subscribe({
      next: (response) => {
        if(response.responce){
          this.students.set(response.responce);
          return;
        }
        this.students.set([])
      },
      complete: () => this.isLoading.set(false)
    })
  }
  onChangeOption($event: string) {
    const keys= this.tripKeys();
    this.isMorning=$event=='M';
    if ($event == 'M' && keys) {
      this.getStudents(keys.morning)
    }
    else if ($event == 'E' && keys) {
      this.getStudents(keys.evening)
    } else {
      this.students.set([])

    }
  }
}
