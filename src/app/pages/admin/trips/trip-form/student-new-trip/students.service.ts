import { Injectable } from '@angular/core';
export type studentTripType = {
  studentTripKey: string,
  studentKey: string,
  name: string,
  parent: string,
  mode: 'M' | 'E' | -1
}
@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  initialList: studentTripType[] = [];
}
