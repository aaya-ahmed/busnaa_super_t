import { Component, effect, input, signal, untracked, WritableSignal } from '@angular/core';
import { Isupervisor } from '../../../../shared/model/supervisor';
import { TranslatePipe } from '@ngx-translate/core';
import { ITripKeys } from '../../../../shared/model/trip';
import { SupervisorService } from '../../../../services/apis/supervisor.service';
import { take } from 'rxjs';
import { MatRadioGroup, MatRadioButton } from "@angular/material/radio";
import { Spinner } from "../../../../shared/component/spinner/spinner";

@Component({
  selector: 'busnaa-trip-supervisor',
  imports: [TranslatePipe, MatRadioGroup, MatRadioButton, Spinner],
  templateUrl: './trip-supervisor.html',
  styleUrl: './trip-supervisor.scss',
})
export class TripSupervisor {
  tripKeys = input<ITripKeys | null>();
  supervisor: WritableSignal<Isupervisor> = signal({} as Isupervisor)
  isMorning = true;
  isLoading = signal(false);
  constructor(private supervisorService: SupervisorService) {
    effect(() => {
      const keys = this.tripKeys();
      untracked(() => {
        if (keys?.morning || keys?.evening)
          this.getSuperVisor(keys.morning || keys.evening);
      })
    })
  }
  getSuperVisor(supervisorId: string) {
    this.isLoading.set(true);
    this.supervisorService.getSupervisor(supervisorId).pipe(take(1)).subscribe({
      next: (response) => {
        if (response.responce) {
          this.supervisor.set(response.responce);
          return;
        }
        this.supervisor.set({} as Isupervisor)
      },
      complete: () => this.isLoading.set(false)
    })
  }
  onChangeOption($event: string) {
    const keys = this.tripKeys();
    this.isMorning = $event == 'M';
    if ($event == 'M' && keys?.morning) {
      this.getSuperVisor(keys.morning)
    }
    else if ($event == 'E' && keys?.evening) {
      this.getSuperVisor(keys.evening)
    } else {
      this.supervisor.set({} as Isupervisor)

    }
  }
}
