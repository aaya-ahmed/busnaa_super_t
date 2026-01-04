import { Injectable } from "@angular/core";
import { BaseService } from "./base.service";
import { SchoolService } from "./school.service";
import { IPutSupervisorData, IPostSupervisorData, Isupervisor } from "../../shared/model/supervisor";
import { map, Observable, switchMap, throwError } from "rxjs";
import { userTypes } from "../../shared/consts/const";
import { TripsService } from "./trip.service";

@Injectable({
    providedIn: 'root'
})
export class SupervisorService extends BaseService<Isupervisor, IPostSupervisorData, IPutSupervisorData> {
    constructor(private _schoolService: SchoolService, private tripService: TripsService) {
        super('users');
    }
    getSupervisors() {
        let busnaa_user = JSON.parse(localStorage.getItem('busnaa_user') || '{}');
        if (!busnaa_user.key) return throwError(() => ({ responce: null, error: 'No User Key' }));
        return this._schoolService.getSchool(busnaa_user.key).pipe(
            switchMap(school => {
                if (!school) return throwError(() => ({ responce: null, error: 'No School Key' }));
                console.log('supervisors')
                return this.getListByChild('type', userTypes.supervisor, `${school?.countryCode}`).pipe(
                    map((item) => {
                        console.log(item)
                        const data = item.responce?.filter((supervisor: Isupervisor) => supervisor.schools == school.key) || [];
                        return {
                            responce: data
                            , error: item.error
                        }
                    }));
            })
        )
    }
    getSupervisor(supervisorId: string){
        const school = this._schoolService.getSchoolFromLocalStorage();
        console.log("s",supervisorId)
        return this.getObject(`/${school?.countryCode}/${supervisorId}`);
    }
    addSupervisor(data: IPostSupervisorData): Observable<{ responce: string | null, error: string | null }> {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.create(data, data.phone, `${school?.countryCode}`);
    }
    updateSupervisor(data: IPutSupervisorData): Observable<{ responce: string | null, error: string | null }> {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.update(data, `${school?.countryCode}`);
    }
    deleteSupervisor(supervisorId: string): Observable<{ responce: boolean | null, error: string | null }> {
        const school = this._schoolService.getSchoolFromLocalStorage();
        if (school) {
            const updates: Record<string, any> = {};
            return this.tripService.getTripsBySupervisor(supervisorId).pipe(
                switchMap(p => {
                    const trips = p.responce || [];
                    // 1 — Remove supervisor
                    updates[`/users/${school.countryCode}/${supervisorId}`] = null;
                    // 2 — Update each trip
                    trips.forEach(t => {
                        updates[`/schools/${school.key}/Trips/${t.key}/supervisor`] = "";
                    });
                    return this.runTransactionOnDb(updates);
                })
            );
        } else
            return new Observable((subscriber) => { subscriber.error({ responce: false, error: 'faild' }) })
    }
    cloneSupervisor(data: IPutSupervisorData): Observable<{
        responce: boolean | null;
        error: string | null;
    }> {
        const school = this._schoolService.getSchoolFromLocalStorage();
        if (school){
            const oldSupervisor=data.key;
            delete (data as any).key;
            return this.addSupervisor(data).pipe(
                switchMap(() => this.tripService.getListByChild('supervisor', oldSupervisor)),
                switchMap((tripRes) => {
                    if (tripRes.responce) {
                        const updates: Record<string, any> = {};
                        updates[`/users/${school.countryCode}/${oldSupervisor}`] = null;
                        tripRes.responce?.forEach(trip => {
                            updates[`/schools/${school.key}/Trips/${trip.key}/supervisor`] = data.phone;
                        });
                        return this.runTransactionOnDb(updates);
                    }
                    return throwError(() => ({ responce: null, error: 'No trips data' }));
                })
            );
        }
        else
        return throwError(() => ({ responce: null, error: 'No school data' }));
    }
}