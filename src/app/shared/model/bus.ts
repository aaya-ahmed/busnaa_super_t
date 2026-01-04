export type IBus = {
        key: string;
} & IBusData;
export interface IBusData {
        name: string,
        plate?:string
        admin_only_chat?:boolean
}
export interface IPostBusData {
        name: string,
        admin_only_chat?:boolean,
        plate?:string
}
export interface IPutBusData {
        key?: string;
        name: string,
        admin_only_chat?:boolean,
        plate?:string


}