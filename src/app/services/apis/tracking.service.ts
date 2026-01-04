import { Injectable } from "@angular/core";
import { BaseService } from "./base.service";
import { SchoolService } from "./school.service";
import { TripsService } from "./trip.service";
import { Itracking, ItrackingData } from "../../shared/model/tracking";

@Injectable({
    providedIn: 'root'
})
export class TrackingService extends BaseService<Itracking,ItrackingData,ItrackingData> {
    constructor(private _schoolService: SchoolService, private tripService:TripsService) {
        super('tracking');
    }
//    gettriptracking(key:string, date:string, tripdata = null) {
//     let schoolId = this._schoolService.getSchoolFromLocalStorage()?.key;

//     let info: any
//     try {
//       info = await firstValueFrom(this.db.object(`${this.trackingPath}/${schoolId}/${date}/${key}`).valueChanges())
//       return { key, trackingdata: info, trip: tripdata };
//     }
//     catch { }
//   }
  getTracking(date:string) {
    let schoolId = this._schoolService.getSchoolFromLocalStorage()?.key;
    return this.getRealTimeObject(`${schoolId}/${date}`)
  }
  getTrackingByTrip(date:string, tripId:string) {
    let schoolId = this._schoolService.getSchoolFromLocalStorage()?.key;
    return this.getRealTimeObject(`${schoolId}/${date}/${tripId}`)
  }
  getCurrentLocationByTrip(date:string, tripId:string) {
    let schoolId = this._schoolService.getSchoolFromLocalStorage()?.key;
    return this.getObject(`${schoolId}/${date}/${tripId}/current_location`)
  }
  getActiveUserByTrip(date:string, tripId:string) {
    let schoolId = this._schoolService.getSchoolFromLocalStorage()?.key;
    return this.getObject(`${schoolId}/${date}/${tripId}/active_users`);
  }
  getAttendanceByTrip(date:string, tripId:string) {
    let schoolId = this._schoolService.getSchoolFromLocalStorage()?.key;
    return this.getObject(`${schoolId}/${date}/${tripId}/attendance`);
  }
}