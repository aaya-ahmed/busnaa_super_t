import { Injectable } from "@angular/core";
import { BaseService } from "./base.service";
import { IPutSchoolLocationData, IPostSchoolLocationData, IschoolLocation } from "../../shared/model/schoolLocation";
import {  Observable, throwError } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SchoolLocationService extends BaseService<IschoolLocation, IPostSchoolLocationData, IPutSchoolLocationData> {
    constructor() {
        super('schoolsLocations');
    }
    getSchoolLocations() {
        let busnaa_user = JSON.parse(localStorage.getItem('busnaa_user') || '{}');
        if (!busnaa_user.key) return throwError(() => ({ responce: null, error: 'No User Key' }));
        return this.getListByChild('account',+busnaa_user.key)
    }
    getSchoolLocation(SchoolLocationId: string){
        return this.getObject(`${SchoolLocationId}`);
    }
    addSchoolLocation(data: IPostSchoolLocationData): Observable<{ responce: string | null, error: string | null }> {
        return this.createWithAutoKey(data);
    }
    updateSchoolLocation(data: IPutSchoolLocationData): Observable<{ responce: string | null, error: string | null }> {
        return this.update(data);
    }
    deleteSchoolLocation(SchoolLocationId: string): Observable<{ responce: boolean | null, error: string | null }> {
        return this.delete(SchoolLocationId)
    }
}