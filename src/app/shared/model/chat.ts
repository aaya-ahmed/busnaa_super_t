export type chatGroup = {
    key: string;
} & chatGroupData;
export interface chatGroupData {
    info: Info
    messages: Messages
}

export interface Info {
    admin_only_chat: boolean
    name: string
    schoolId: number
}

export interface Messages {
    [key: string]: messageInfo
}

export interface messageInfo {
    from: string
    message: string
    senderName: string
    time: string
    type: string
    voiceState: string
}
export interface IPostGroupData {
    info: Info,
    message?:Messages
}
export interface IPutGroupData {
    key?: string;
    info: Info,
    message?:Messages
}
