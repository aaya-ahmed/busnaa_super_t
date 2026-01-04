export type Itrip = {
        key: string;
} & ITripData;
export interface ITripData {
        bus: string,
        start: string,
        end: string,
        name: string,
        school_locationId?: string,
        school_location?: string,
        status?: number,
        supervisor?: string,
        to_school: boolean,
        'additional-supervisors': IAdditionalSupervisor
}
export interface IAdditionalSupervisor {
        [key: string]: string
}
export interface IPostTripData {
        name: string,
        bus: string,
        start: string,
        end: string,
        school_locationId: string,
        supervisor: string,
        to_school: boolean,
        status?: number
}
export interface IPutTripData {
        key?: string;
        name: string,
        bus: string,
        start: string,
        end: string,
        school_locationId: string,
        supervisor: string,
        to_school: boolean,
        status?: number
}
export interface ITransferdTrip {
        name: string,
        bus: string,
        morning: Itrip,
        evening: Itrip
}
export interface ITripKeys {
        morning: string,
        evening: string
}