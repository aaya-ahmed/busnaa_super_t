import { Injectable } from "@angular/core";
import { BaseService } from "./base.service";
import { SchoolService } from "./school.service";
import { forkJoin, map, Observable, of, switchMap } from "rxjs";
import { IPostStudentTripsData, IPutStudentTripsData, IStudentTrips } from "../../shared/model/studentTrips";
import { IStudent } from "../../shared/model/student";

@Injectable({
    providedIn: 'root'
})
export class StudentTripsService extends BaseService<IStudentTrips, IPostStudentTripsData, IPutStudentTripsData> {
    constructor(private _schoolService: SchoolService) {
        super('schools');
    }

    getStudentTrips(student: string): Observable<{
        responce: IStudentTrips[] | null;
        error: string | null;
    }> {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.getListByChild('student', student, `${school?.key}/students-trips`)

    }
    getStudentTripsByTripId(id: string): Observable<{
        responce: IStudentTrips[] | null;
        error: string | null;
    }> {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.getListByChild('trip', id, `${school?.key}/students-trips`)

    }
    addStudentToTrip(studentKey:string,tripId:string,order:number){
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.createWithAutoKey({
            student:studentKey,
            trip:tripId,
            order:order
        },`${school?.key}/students-trips`);
    }
    deleteStudentFromTrip(studentTripKey:string){
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.delete(studentTripKey,`${school?.key}/students-trips`);
    }
}