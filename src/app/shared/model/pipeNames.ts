const pipeNames={
    CustomdatePipe:'CustomdatePipe',
    NotnanPipe:'NotnanPipe'
} as const
export type pipeName=keyof typeof pipeNames