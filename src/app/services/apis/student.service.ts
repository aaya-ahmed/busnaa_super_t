import { Injectable } from "@angular/core";
import { BaseService } from "./base.service";
import { SchoolService } from "./school.service";
import { catchError, combineLatest, filter, forkJoin, map, mergeMap, Observable, ObservableInput, of, switchMap, throwError } from "rxjs";
import { TripsService } from "./trip.service";
import { IPostStudentData, IPostStudentDataQuery, IPutStudentData, IPutStudentDataQuery, IStudent } from "../../shared/model/student";
import { ParentService } from "./parent.service";
import { StudentTripsService } from "./student-trips.service";

@Injectable({
    providedIn: 'root'
})
export class StudentService extends BaseService<IStudent, IPostStudentDataQuery, IPutStudentDataQuery> {
    constructor(private _schoolService: SchoolService, private studentTripsService: StudentTripsService) {
        super('schools');
    }

    getStudent(studentId: string) {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.getObject(`${school?.key}/Students/${studentId}`);
    }
    addStudent(data: IPostStudentDataQuery): Observable<{ responce: string | null, error: string | null }> {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.createWithAutoKey(data, `${school?.key}/Students`);
    }
    updateStudent(data: IPutStudentDataQuery): Observable<{ responce: string | null, error: string | null }> {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.update(data, `${school?.key}/Students`);
    }
    deleteStudent(studentId: string): Observable<{ responce: boolean | null, error: string | null }> {
        const school = this._schoolService.getSchoolFromLocalStorage();
        if (school) {
            const updates: Record<string, any> = {};
            return this.studentTripsService.getStudentTrips(studentId).pipe(
                switchMap(p => {
                    const trips = p.responce || [];
                    // 1 — Remove student
                    updates[`/schools/${school.key}/Students/${studentId}`] = null;
                    // 2 — Update each trip
                    trips.forEach(t => {
                        updates[`/schools/${school.key}/students-trips/${t.key}`] = null;
                    });
                    return this.runTransactionOnDb(updates);
                })
            );
        } else
            return new Observable((subscriber) => { subscriber.error({ responce: false, error: 'faild' }) })
    }
    getStudentByPhone(phone: string) {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.getListByChild('parent', phone, `${school?.key}/Students`);
    }
    getStudentsByTrip(tripId: string):
        Observable<{
            responce: (IStudent&{studentTripKey:string})[];
            error: null;
        }> {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.studentTripsService.getStudentTripsByTripId(tripId).pipe(
            switchMap((studentTrips) => {
                const requests: {studentTripKey:string,request:ObservableInput<any>}[] = []
                studentTrips.responce?.forEach(responce => { 
                    requests.push({studentTripKey:responce.key,request:this.getObject(`${school?.key}/Students/${responce.student}`)})
                })
                return forkJoin(requests.map(p=>p.request)).pipe(
                    map((students,i) => {
                        return {
                            responce: students.map(s => ({...(s.responce),studentTripKey:requests[i].studentTripKey})),
                            error: null
                        }
                    })
                );
            }),
            catchError(error=> of({
                responce: [],
                error: error.message
            }))
        );
    }
    getStudentsByName(name: string){
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.searchByChild(`${school?.key}/Students`,undefined,'name',name, 20);
    }
    // clonestudent(data: IPutStudentData): Observable<{
    //     responce: boolean | null;
    //     error: string | null;
    // }> {
    //     const school = this._schoolService.getSchoolFromLocalStorage();
    //     if (school){
    //         const oldstudent=data.key;
    //         delete (data as any).key;
    //         return this.addstudent(data).pipe(
    //             switchMap(() => this.tripService.getListByChild('student', oldstudent)),
    //             switchMap((responce) => {
    //                 if (responce.responce?.data) {
    //                     const updates: Record<string, any> = {};
    //                     updates[`/users/${school.data.countryCode}/${oldstudent}`] = null;
    //                     responce.responce?.data.forEach(trip => {
    //                         updates[`/schools/${school.key}/Trips/${trip.key}/student`] = data.phone;
    //                     });
    //                     return this.runTransactionOnDb(updates);
    //                 }
    //                 return throwError(() => ({ responce: null, error: 'No trips data' }));
    //             })
    //         );
    //     }
    //     else
    //     return throwError(() => ({ responce: null, error: 'No school data' }));
    // }
}