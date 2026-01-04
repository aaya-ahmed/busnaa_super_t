export type IStudentTrips= {
        key: string;
}&IStudentTripsData;
export interface IStudentTripsData {
        trip:string,
        student:string,
        order:number
}

export interface IPostStudentTripsData {
        trip:string,
        student:string,
        order:number
}
export interface IPutStudentTripsData {
        key?: string;
        trip:string,
        student:string,
        order:number
}