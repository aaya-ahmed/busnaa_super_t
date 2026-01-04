import { inject, Injectable } from "@angular/core";
import { BaseService } from "./base.service";
import { Ischool } from "../../shared/model/school";
import { of, switchMap, take } from "rxjs";
import { Router } from "@angular/router";
import { FIREBASE_AUTH } from "../../firebase.config";
@Injectable({
    providedIn: 'any'
})
export class SchoolService extends BaseService<Ischool, Ischool, Ischool> {
    private afAuth = inject(FIREBASE_AUTH);
    private route = inject(Router);
    constructor() {
        super('schools');
    }
    getSchool(schoolId: string) {
        let school = localStorage.getItem('busnaa_school');
        if (school) return of(JSON.parse(school) as Ischool);
        return this.getObject(`${schoolId}/info`).pipe(
            take(1),
            switchMap((schoolData) => {
                if (schoolData.responce) {
                    schoolData.responce.key = schoolId;
                    localStorage.setItem('busnaa_school', JSON.stringify(schoolData.responce));
                    return of(schoolData.responce as Ischool);
                }
                return of();
            }
            ));
    }
    getSchoolFromLocalStorage() {
        let school = localStorage.getItem('busnaa_school');
        if (school) return JSON.parse(school) as Ischool;
        this.SignOut();
        return null;
    }
    SignOut() {
        localStorage.removeItem('busnaa_user');
        this.afAuth.signOut();
        this.route.navigate(['/']);
    }
    updateSchool(data: Ischool) {
        const key= `${data.key!}`;
        data.key='info';
        return this.update(data, `${key}`).pipe(
            switchMap((res) => {
                if (!res.error) {
                    localStorage.setItem('busnaa_school', JSON.stringify({...data,key:key}));
                }
                return of(res);
            })
        );
    }
}