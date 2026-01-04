import { Component, effect, input, signal, untracked, WritableSignal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { take } from 'rxjs';
import { IBus } from '../../../../shared/model/bus';
import { BusService } from '../../../../services/apis/bus.service';
import { Spinner } from "../../../../shared/component/spinner/spinner";

@Component({
  selector: 'busnaa-trip-bus',
  imports: [TranslatePipe, Spinner],
  templateUrl: './trip-bus.html',
  styleUrl: './trip-bus.scss',
})
export class TripBus {
 busId = input<string | null>();
  bus: WritableSignal<IBus> = signal({} as IBus)
  isMorning = true;
  isLoading = signal(false);
  constructor(private busService: BusService) {
    effect(() => {
      const busId = this.busId();
      untracked(() => {
        if (busId)
          this.getBus(busId);
      })
    })
  }
  getBus(busId: string) {
    this.isLoading.set(true);
    this.busService.getBus(busId).pipe(take(1)).subscribe({
      next: (response) => {
        if (response.responce) {
          this.bus.set(response.responce);
          return;
        }
        this.bus.set({} as IBus)
      },
      complete: () => this.isLoading.set(false)
    })
  }
}
