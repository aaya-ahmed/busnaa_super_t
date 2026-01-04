import { Component, effect, input, signal, untracked } from '@angular/core';
import { TripsService } from '../../../../services/apis/trip.service';
import { take } from 'rxjs';
import { Itrip } from '../../../../shared/model/trip';
import { ToastService } from '../../../../services/toast.service';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatCard } from "@angular/material/card";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'busnaa-student-trip',
  imports: [MatProgressSpinner, MatCard, MatCheckboxModule, TranslatePipe],
  templateUrl: './student-trip.html',
  styleUrl: './student-trip.scss',
})
export class StudentTrips {
  studentId = input('');
  data = signal<{loading:boolean,trips:Itrip[]}>({
    trips: [],
    loading: true
  })
  constructor(private tripsService: TripsService, private toast: ToastService) {
    effect(() => {
      const id = this.studentId();
      console.log("studentId",this.studentId())
      untracked(() => {
        if (id)
          this.getTrips(id)
      })
    })
  }
  getTrips(id: string) {
    this.tripsService.getTripsByStudent(id).pipe(take(1)).subscribe({
      next: (responce) => {
        console.log("studentId",responce)
        this.data.set({
          loading:false,
          trips:responce?.responce ?? []
        });
      },
      error: () => {
        this.toast.show('error', 'there are error occured');
         this.data.set({
          loading:false,
          trips:[]
        });
      },
    })
  }

}
