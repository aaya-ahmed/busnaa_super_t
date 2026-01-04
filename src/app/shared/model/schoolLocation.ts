export type IschoolLocation ={
    key: string;
}&ISchoolLocationData;
export interface ISchoolLocationData {
    name:string,
    location:string,
    country?:string,
    government?:string,
    account?:number
}
export interface IPostSchoolLocationData {
    name:string,
    location:string,
    country?:string,
    government?:string,
    account?:number
}
export interface IPutSchoolLocationData {
    key:string,
    name:string,
    location:string,
    country?:string,
    government?:string,
    account?:number
}