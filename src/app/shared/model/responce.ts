export interface dataResponce<T> {
    responce: T[] | null,
    error: string | null
}



export interface oneDataResponce<T> {
    data: T | string | boolean,
}
export type messageResponce = {
    message: string
}
export const initialResponce = {
    responce: { key: '', data: [] },
    error: null
}
