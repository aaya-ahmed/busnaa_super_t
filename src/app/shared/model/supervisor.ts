export type Isupervisor ={
    key: string;
}&ISupervisorData
export interface ISupervisorData {
        isBlocked?: boolean;
        address?: string,
        latlng?: string,
        name: string,
        phone: string,
        schools: string,
        track_info?: ITrackInfo,
        type: number
        user_key?: string
}
export interface IPostSupervisorData {
        isBlocked?: boolean;
        name: string,
        phone: string,
        schools: string,
        type: number
}
export interface IPutSupervisorData {
        key:string;
        isBlocked: boolean;
        name: string,
        phone: string,
        schools: string,
        type: number
}
export interface ITrackInfo {
    active?: boolean,
    app_version?: number,
    device_info?: string,
    device_ram?: number,
    online?: boolean,
    platform?: string,
    platform_version?: number,
    last_seen?:string
}
