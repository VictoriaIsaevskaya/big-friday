import {ChatMessage} from "../../features/chats/model/interfaces/chat.interface";

export class SendMessage {
  static readonly type = '[Chat] Send Message';
  constructor(public payload: { chatId: string; message: ChatMessage }) {}
}

export class LoadChatMessages {
  static readonly type = '[Chat] Load Chat Messages';
  constructor(public payload: { chatId: string }) {}
}

export class LoadCurrentChat {
  static readonly type = '[Chat] Load Current Chat';
  constructor(public payload: { chatId: string }) {}
}

export class UpdateLastMessage {
  static readonly type = '[Chat] Update Last Message';
  constructor(public payload: {chatId: string, lastMessage: ChatMessage}) {}
}

export class ResetUnreadMessages {
  static readonly type = '[Chat] Reset Unread Messages';
}

export class UpdateUnreadMessagesCount {
  static readonly type = '[Chat] Update Unread Messages Count';
  constructor(public payload: { unreadMessagesCount: number }) {}
}

export class FetchUnreadMessagesCount {
  static readonly type = '[Chat] Fetch Unread Messages Count';
}

