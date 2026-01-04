import { firstValueFrom, forkJoin, map, mergeMap, Observable, of, switchMap, take, throwError } from "rxjs";
import { ParentService } from "./parent.service";
import { SchoolService } from "./school.service";
import { StudentService } from "./student.service";
import { Injectable } from "@angular/core";
import { IStudent } from "../../shared/model/student";
import { IPutParentData } from "../../shared/model/parent";
@Injectable({
    providedIn: 'any'
})

export class StudentParentService {
    constructor(private studentService: StudentService, private parentService: ParentService, private schoolService: SchoolService) { }
    getSearchedStudentsPaged(startKey?: { value: string, key: string }, searchingKey: '' | 'name' | 'parent' = '', searchingValue?: string) {
        const school = this.schoolService.getSchoolFromLocalStorage();
        if (!school) return throwError(() => ({ responce: null, error: 'No School Key' }));
        return this.studentService.searchByChild(`${school.key}/Students`, startKey, searchingKey, searchingValue, 20).pipe(
            mergeMap((students) => {
                if (students.responce?.length) {
                    const detailRequests$ = students.responce.map(student => {
                        return this.parentService.getparent(student.parent).pipe(
                            map(details => {
                                if (details.responce)
                                    student = { ...student, parentInfo: details.responce }
                                return student;
                            })
                        )
                    });
                    return forkJoin(detailRequests$).pipe(map(s => {
                        return {
                            responce: s,
                            error: ''
                        }
                    }))
                } else {
                    return of({
                        responce: [],
                        error: ''
                    });
                }
            })
        )
    }
    updateparentPhone(oldPhone: string, newParentData: Required<IPutParentData>, deleteOldParent: boolean = true) {
        const school = this.schoolService.getSchoolFromLocalStorage();
        return forkJoin([
            this.parentService.getparent(newParentData.phone).pipe(take(1)),
            this.parentService.getparent(oldPhone).pipe(take(1))
        ]).pipe(
            switchMap(([newParentResponce, oldParentResponce]) => {
                if (oldParentResponce.responce) {
                    if (newParentResponce.responce) {
                        if (deleteOldParent) {
                            console.log("deleting old parent");
                            return forkJoin([this.parentService.updateparent({
                                ...newParentData, key: newParentResponce.responce.key
                            }),
                            this.parentService.delete(oldPhone, `${school?.countryCode}`)])
                        }
                        else {
                            console.log("not deleting old parent");
                            return forkJoin([this.parentService.updateparent({ ...newParentData, key: newParentResponce.responce.key })])
                        }
                    } else {
                        if (deleteOldParent) {
                            console.log("deleting old parent");
                            return forkJoin([this.parentService.addparent({ ...newParentData, addedDate: new Date().toISOString() }),
                            this.parentService.delete(oldPhone, `${school?.countryCode}`)])
                        }
                        else {
                            console.log("not deleting old parent");
                            return forkJoin([this.parentService.addparent({ ...newParentData, addedDate: new Date().toISOString() })])
                        }
                    }
                }
                return of([]);
            }),

            switchMap(() => deleteOldParent ? this.studentService.getListByChild('parent', oldPhone,`${school?.key}/Students`) : of({ responce: [], error: '' })),
            switchMap(responce => {
                const updates: any[] = [];
                console.log('Updating students with new parent phone:', responce);
                if (responce.responce?.length) {
                    responce.responce?.forEach(ele => {
                        updates.push(this.studentService.updateStudent({
                            ...ele,
                            parent: newParentData.phone
                        }))
                    });
                    console.log('Updating students with new parent phone:', updates);
                    return forkJoin(updates)
                }
                return of([])
            })
        )
    }
    getParentHasMultipleStudent(phone: string) {
        return this.studentService.getStudentByPhone(phone).pipe(
            switchMap(res => of(res.responce && res.responce.length > 1 ? true : false))
        )
    }
}