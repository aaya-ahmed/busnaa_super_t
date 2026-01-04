import { ITrackInfo } from "./supervisor";
export type IParent = {
        key: string;
} & IParentData;

export interface IParentData {
        isBlocked?: boolean;
        address?: string,
        latlng?: string,
        name: string,
        phone: string,
        schools: string,
        addedDate: string,
        track_info?: ITrackInfo,
        type: number
        user_key?: string,
        updatedDate?:string,
}

export interface IPostParentData {
        isBlocked?: boolean;
        name: string,
        phone: string,
        schools: string,
        type: number,
        addedDate: string,
        address?: string,
        latlng?: string,
        
}
export interface IPutParentData {
        key: string;
        isBlocked: boolean;
        name: string,
        phone: string,
        schools: string,
        type: number,
        address?: string,
        latlng?: string,
        updatedDate?:string,
}