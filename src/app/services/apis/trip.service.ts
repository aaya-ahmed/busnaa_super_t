import { Injectable } from "@angular/core";
import { BaseService } from "./base.service";
import { SchoolService } from "./school.service";
import { firstValueFrom, forkJoin, map, mergeMap, Observable, of, switchMap, take } from "rxjs";
import { StudentTripsService } from "./student-trips.service";
import { IAdditionalSupervisor, IPostTripData, IPutTripData, ITransferdTrip, Itrip } from "../../shared/model/trip";
import { dataResponce } from "../../shared/model/responce";
import { Ischool } from "../../shared/model/school";

@Injectable({
    providedIn: 'root'
})
export class TripsService extends BaseService<Itrip, IPostTripData, IPutTripData> {
    private school:Ischool | null=null
    constructor(private _schoolService: SchoolService, private studentTripsService: StudentTripsService) {
        super('schools');
        this.school = this._schoolService.getSchoolFromLocalStorage();

    }
    getTripsList(): Observable<dataResponce<ITransferdTrip>> {
        return this.getList(`${this.school?.key}/Trips`).pipe(
            map((items) => {
                const tripMap = new Map<string, any>();
                tripMap.clear(); // reset each time
                items.responce?.forEach(trip => {
                    const isMorning = trip.to_school;
                    if (!tripMap.has(trip.bus)) {
                        tripMap.set(trip.bus, {
                            name: trip.name,
                            bus: trip.bus
                        })
                    }
                    if (isMorning) {
                        tripMap.get(trip.bus).morning = {
                            key: trip.key,
                            start: trip.start,
                            end: trip.end,
                            additional_supervisors: trip['additional-supervisors'],
                            supervisor: trip.supervisor,
                            status: trip.status,
                            school_locationId: trip.school_locationId,
                            school_location: trip.school_location,
                        }
                    } else {
                        tripMap.get(trip.bus).evening = {
                            key: trip.key,
                            start: trip.start,
                            end: trip.end,
                            additional_supervisors: trip['additional-supervisors'],
                            supervisor: trip.supervisor,
                            status: trip.status
                        }
                    }
                }
                )
                return {
                    responce: Array.from(tripMap.values()),
                    error: ''
                }
            }
            ))
    }
    addTrip(data: IPostTripData) {
        return this.createWithAutoKey(data, `${this.school?.key}/Trips`);
    }
    updateTrips(data: Partial<IPutTripData>) {
        return this.update(data as IPutTripData, `${this.school?.key}/Trips`);
    }
    getTripsBySupervisor(supervisor: string) {
        return this.getListByChild('supervisor', supervisor, `${this.school?.key}/Trips`)
    }
    getTripsByStudent(student: string) {
        return this.studentTripsService.getStudentTrips(student).pipe(
            take(1),
            mergeMap((studentTrip) => {
                const requests = studentTrip.responce?.map(responce => {
                    return this.getObject(`${this.school?.key}/Trips/${responce.trip}`)
                })
                if (requests && requests.length > 0) {
                    return forkJoin(requests).pipe(
                        map((trips) => {
                            return {
                                responce: trips.map(r => r.responce).filter(p => !!p),
                                error: null
                            }
                        })
                    );

                }
                else return of({
                    responce: null,
                    error: ''
                })
            })
        )
    }
    getAdditionalSupervisorForTrip(tripKey:string){
        return this.getChildList<IAdditionalSupervisor>(`${this.school?.key}/Trips/${tripKey}/additional-supervisors`)
    }
    updateSupervisorForTrip(tripKey: string, supervisor: string): Observable<{ responce: string | null, error: string | null }> {
        return this.updateLastChild({ supervisor: supervisor }, `${this.school?.key}/Trips/${tripKey}`);
    }
    deleteTrip(keys: { morning: string, evening: string }, busId: string): Observable<{ responce: boolean | null, error: string | null }> {
        if (this.school) {
            const updates: Record<string, any> = {};
            return forkJoin([
                this.studentTripsService.getStudentTripsByTripId(keys.morning),
                this.studentTripsService.getStudentTripsByTripId(keys.evening)
            ]).pipe(
                switchMap(([morningTrip, eveningTrip]) => {
                                        console.log("Updates for deleteTrip:", updates);
                    const trips = (morningTrip.responce || []).concat(eveningTrip.responce || []);
                    // 1 — Remove trips
                    updates[`/schools/${this.school?.key}/Trips/${keys.morning}`] = null;
                    updates[`/schools/${this.school?.key}/Trips/${keys.evening}`] = null;
                    // 2 — Update each trip
                    trips.forEach(t => {
                        if(t.key)
                        updates[`/schools/${this.school?.key}/students-trips/${t.key}`] = null;
                    });
                    //3- remove bus
                    if(busId)
                    updates[`/schools/${this.school?.key}/buses/${busId}`] = null;
                    console.log("Updates for deleteTrip:", updates);
                    return this.runTransactionOnDb(updates);
                })
            );
        } else
            return new Observable((subscriber) => { subscriber.error({ responce: false, error: 'faild' }) })
    }
    removeExSupervisorTrip(tripKey:string,supervisorKey:string){
        return firstValueFrom(this.delete(supervisorKey,`${this.school?.key}/Trips/${tripKey}/additional-supervisors`))
    }
      setTripExSupervisor(tripKey:string,supervisorKey:string){
        return firstValueFrom(this.createChild(supervisorKey,`${this.school?.key}/Trips/${tripKey}/additional-supervisors/${supervisorKey}`))
    }
}