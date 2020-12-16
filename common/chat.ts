declare namespace common {
  export interface IMessage {
    author: string,
    message: string,
    time: number,
  }

  export interface IChatMember {
    last_online: number,
    // In group chats, this should be the users name, otherwise 'Santa' or 'Giftee'
    display_name: string,
  }

  export interface IChat {
    members: { [uid: string]: IChatMember },
    messages: { [messageId: string]: IMessage },
  }
}
