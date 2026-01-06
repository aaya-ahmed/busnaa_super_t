import { Injectable } from "@angular/core";
import { BaseService } from "./base.service";
import { SchoolService } from "./school.service";
import { IParent, IPostParentData, IPutParentData } from "../../shared/model/parent";
import { filter, of, switchMap } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ParentService extends BaseService<IParent, IPostParentData, IPutParentData> {
    constructor(private _schoolService: SchoolService) {
        super('users');
    }
    getFristTenparentsList(phone: string) {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.searchByChild(`${school?.countryCode}`,undefined,'phone',phone,10).pipe(
           switchMap(res=>{
            if(res.responce){
                res.responce=res.responce.filter(p=>p.schools==school?.key);
            }
            return of(res);
           })
        );
    }
    getparent(phone: string) {
        const school = this._schoolService.getSchoolFromLocalStorage();
        if (!school) throw new Error('No School Key');
        // console.log('getting parent for phone:', phone, 'and school key:', school.key);
        return this.getObject(`${school?.countryCode}/${phone}`);
    }
    addparent(data: Required<IPostParentData>) {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.create(data, data.phone, `${school?.countryCode}`);
    }
    updateparent(data: Required<IPutParentData>) {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.update(data, `${school?.countryCode}`);
    }
}