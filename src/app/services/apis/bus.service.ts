import { Injectable } from "@angular/core";
import { BaseService } from "./base.service";
import { SchoolService } from "./school.service";
import { IBus, IPostBusData, IPutBusData } from "../../shared/model/bus";

@Injectable({
    providedIn: 'root'
})
export class BusService extends BaseService<IBus, IPostBusData, IPutBusData> {
    constructor(private _schoolService: SchoolService) {
        super('schools');
    }
    addBus(data: IPostBusData) {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.createWithAutoKey(data, `${school?.key}/buses`);
    }
    updateBus(data: IPutBusData) {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.update(data, `${school?.key}/buses`);
    }
    getBus(busId: string) {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.getObject(`${school?.key}/buses/${busId}`)
    }
    getBuses() {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.getList(`${school?.key}/buses`);
    }
    deleteBus(key:string) {
        const school = this._schoolService.getSchoolFromLocalStorage();
        return this.delete(key,`${school?.key}/buses`);
    }
}