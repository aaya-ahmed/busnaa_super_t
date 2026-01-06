import { Injectable } from '@angular/core';
import { SchoolService } from './school.service';
import { ParentService } from './parent.service';
import { map } from 'rxjs';
import { BaseService } from './base.service';
import { chatGroup, IPostGroupData, IPutGroupData, Messages } from '../../shared/model/chat';

@Injectable({
  providedIn: 'root'
})
export class MessagesService extends BaseService<chatGroup, IPostGroupData, IPutGroupData> {
  constructor(private schoolservice: SchoolService, private parentservice: ParentService) {
    super('chat_group')
  }
  public addChatGroup(key: string, info: IPostGroupData) {
    return this.create(info, key)
  }
  public updateChatGroup(buskey: string, info: IPutGroupData) {
    // this.getChatGroup(buskey).then(res=>{
    //   if(!res.val()){
    //     this.addChatGroup(buskey,info);
    //   }
    //   else{

    //     info={...info,
    //       schoolId:this.schoolservice.getSchoolFromLocalStorage()?.key
    //     }
    //     return this.db.list(`chat_group`).update(buskey,{info:info})
    //   }
    // })
  }
  // public addNewMessage(buskey: string, message: Messages) {
  //   return this.createWithAutoKey(message , `${buskey}/messages`)
  // }
  public deleteChatGroup(key:string) {
    return this.delete(`${key}`)
  }
  public getChatGroup(key:string) {
    return this.getObject(`${key}`)
  }
  public getChatGroupInfo(key:string) {
    return this.getObject(`${key}/info`);
  }
  // public getmessages(buskey, busname, numberofmessages, lastmessage?) {
  //   if (lastmessage) {
  //     return this.db.list(`chat_group/${buskey}/messages`, ref => ref.limitToLast(numberofmessages + 1).orderByKey().endAt(lastmessage)).snapshotChanges().pipe(map(items => {
  //       return items.map((item: any) => {
  //         return { key: item.key, bus: busname, data: item.payload.val() }
  //       })
  //     })
  //     )
  //   }
  //   else {
  //     return this.db.list(`chat_group/${buskey}/messages`, ref => ref.limitToLast(numberofmessages + 1)).snapshotChanges().pipe(map(items => {
  //       return items.map((item: any) => {
  //         return { key: item.key, bus: busname, data: item.payload.val() }
  //       })
  //     })
  //     )
  //   }

  // }
  // public setMemberToChatGroup(buskey, userkey) {

  //   return this.db.list(`chat_group_members/${buskey}`).set(userkey, userkey);
  // }
  // public deleteMemberFromChatGroup(buskey, userkey) {
  //   return this.db.list(`chat_group_members/${buskey}`).remove(userkey)
  // }
  // public deleteParentFromChatGroup(buskey, parent, studentid, tripid) {
  //   let schoolCountryId = this.schoolservice.getSchoolInfo().countryCode;
  //   this.deleteMemberFromChatGroup(buskey, parent)
  //   let subscriber = this.db.object(`users/${schoolCountryId}/${parent}`).valueChanges().subscribe(
  //     (res: any) => {
  //       let studentlist = []
  //       if (res.studentsList) { studentlist = Object.values(res.studentsList) }
  //       studentlist.forEach((p: any) => {
  //         let subscriber2 = this.parentservice.getStudentTripData(p.studentId).subscribe((res: any) => {
  //           if (Array.isArray(res)) {
  //             res.forEach(t => {
  //               if (t.trip?.bus == buskey && ((studentid != p.studentId && t.data.trip == tripid) || (studentid == p.studentId && t.data.trip != tripid)))
  //                 this.setMemberToChatGroup(buskey, parent)
  //             })
  //           }
  //           subscriber2.unsubscribe()
  //         })
  //         subscriber.unsubscribe()
  //       })
  //     })
  // }
  // public deletegroup(key:string) {
  //   this.db.object(`chat_group_members/${buskey}`).remove()
  // }
}
