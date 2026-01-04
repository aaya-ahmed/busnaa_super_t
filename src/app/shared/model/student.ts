import { IParentData } from "./parent";

export type IStudent ={
    key: string;
}&IStudentData;
export type IStudentData={
    name:string,
    parent:string,
    parentInfo:IParentData

    // parent: parentGetDto,
    // trips:number[]
}
export interface IPostStudentDataQuery {
        name: string,
        parent: string,
}
export interface IPutStudentDataQuery {
        key:string;
        name: string,
        parent: string,
}
export interface IPostStudentData {
        isBlocked?: boolean;
        name: string,
        parent: string,
        schools: string,
        type: number,
        address?:string,
        latlng?:string
}
export interface IPutStudentData {
        key:string;
        isBlocked?: boolean;
        name: string,
        parent: string,
        schools: string,
        type: number,
        address?:string,
        latlng?:string,
        addedDate:string,
        updatedDate:string,
}