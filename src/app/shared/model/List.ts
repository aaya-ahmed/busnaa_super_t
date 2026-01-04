import { pipeName } from "./pipeNames";

export type labelsDto = { label: string, class?: string }
export type rowKeysDto<T> = { key: NestedKey<T>,pipe?: pipeName, pipeArg?: string[], class?: string,successIcon?:string,faildIcon?:string }
export type actionsDto<T> = { tooltip: string, click: (e: any) => any, icon: string, key?: string,check?:NestedKey<T, ""> }
export type dataType = "string" | "boolean" | "number" | "date";
type MaxDepth = 5;
export type NestedKey<T, Prefix extends string = '', Depth extends number[] = []> =
  Depth['length'] extends MaxDepth
  ? never 
  : {
    [K in Extract<keyof T, string>]: T[K] extends object
    ? `${Prefix}${K}` | NestedKey<T[K], `${Prefix}${K}?.`, [...Depth, 1]>
    : `${Prefix}${K}`;
  }[Extract<keyof T, string>];