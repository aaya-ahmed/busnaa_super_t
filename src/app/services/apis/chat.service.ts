import { Injectable } from '@angular/core';
import { SchoolService } from './school.service';
import { ParentService } from './parent.service';
import { firstValueFrom, of } from 'rxjs';
import { BaseService } from './base.service';
import { chatGroup, IPostGroupData, IPutGroupData } from '../../shared/model/chat';

@Injectable({
  providedIn: 'any'
})
export class ChatService extends BaseService<chatGroup, IPostGroupData, IPutGroupData> {
  constructor(private schoolservice: SchoolService, private parentservice: ParentService) {
    super('chat_group')
  }
  public addChatGroup(key: string, chat: IPostGroupData) {
    return this.create(chat, key)
  }
  public updateChatGroup(chat: IPutGroupData) {
      const schoolKey = this.schoolservice.getSchoolFromLocalStorage()?.key;
      if (schoolKey) {
        chat.info.schoolId = +schoolKey
        return this.update(chat)
      }
      return of({
        responce: null,
        error: ''
      })
  }
  public deleteChatGroup(key: string) {
    return this.delete(`${key}`)
  }
  public getChatGroup(key: string) {
    return this.getObject(`${key}`)
  }
  public getChatGroupInfo(key: string) {
    return this.getObject(`${key}/info`);
  }
}
