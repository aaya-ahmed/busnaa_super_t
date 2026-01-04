export type Itracking = {
        key: string;
} & ItrackingData;
export interface ItrackingData {
  active_users?: ActiveUsers
  attendance?: Attendance
  bus?: string
  current_location?: string
  driver_speed?: number
  end_at?: string
  rout?: Rout
}

export interface ActiveUsers {
  [key: string]: string
}

export interface Attendance {
    [key: string]: AttendanceRecord,
}

export interface AttendanceRecord {
  arrival_location?: string
  arrival_time?: string
  real_arrival_time?: string
  station_status?: number
  waiting_time?: string
}


export interface Rout {
  [key: string]: string
}
