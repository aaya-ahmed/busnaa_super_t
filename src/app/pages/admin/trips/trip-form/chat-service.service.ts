import { Injectable } from '@angular/core';
import { ChatService } from '../../../../services/apis/chat.service';
import { SchoolService } from '../../../../services/apis/school.service';
import { IPostGroupData, IPutGroupData } from '../../../../shared/model/chat';

@Injectable({
  providedIn: 'root'
})
export class ChatServiceService {

  constructor(private chatservice: ChatService,
     private schoolService: SchoolService
    ) { }
  addusertotripchat(buskey:string, userphone:string) {
    // this.chatservice.setMemberToChatGroup(buskey, userphone)
  }
  deleteusertotripchat(buskey:string, userphone:string) {
    // this.chatservice.deleteMemberFromChatGroup(buskey, userphone)
  }
  async deleteSubervisorFromTripChat(buskey:string, supervisor:string) {
    // await firstValueFrom(this.schoolService.getSupervisorTrips(Supervisor)).then((res: any[]) => {
    //   if (res.length != 0) {
    //     res = res.filter(p => p.bus == buskey)
    //     if (res.length == 1) { this.chatservice.deleteMemberFromChatGroup(buskey, Supervisor) }
    //   }
    //   this.sidebar.load({ open: false });
    // });
  }
  updateChatGroup( chat: IPutGroupData) {
    return this.chatservice.updateChatGroup(chat)
  }
  addChatGroup(busKey:string, chat:IPostGroupData) {
    return this.chatservice.addChatGroup(busKey, chat)
  }
  deleteChatGroup(busKey:string) {
    return this.chatservice.deleteChatGroup(busKey)
  }

}
