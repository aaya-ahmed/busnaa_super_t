import { Component, effect, ElementRef, input, model, signal, untracked, ViewChild } from '@angular/core';
import { TripsService } from '../../../../services/apis/trip.service';
import { take } from 'rxjs';
import { Itrip } from '../../../../shared/model/trip';
import { ToastService } from '../../../../services/toast.service';
import { Modal } from "../../../../shared/component/modal/modal";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatCard } from "@angular/material/card";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'busnaa-supervisor-trip',
  imports: [MatProgressSpinner, MatCard, MatCheckboxModule, TranslatePipe],
  templateUrl: './supervisor-trip.html',
  styleUrl: './supervisor-trip.scss',
})
export class SupervisorTrip {
  supervisorId = input('');
  data = signal<{loading:boolean,trips:Itrip[]}>({
    trips: [],
    loading: true
  })
  constructor(private tripsService: TripsService, private toast: ToastService) {
    effect(() => {
      const id = this.supervisorId();
      console.log(this.supervisorId())
      untracked(() => {
        if (id)
          this.getTrips(id)
      })
    })
  }
  getTrips(id: string) {
    console.log("id",id)
    this.tripsService.getTripsBySupervisor(id).pipe(take(1)).subscribe({
      next: (responce) => {
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
