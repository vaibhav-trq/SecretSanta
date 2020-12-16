declare namespace common {
  /**
   * Top level schema by which the database is organized.
   * 
   * Common Abbriviations.
   * 
   * uid: user id
   * eid: event id
   * rid: room id
   */
  export interface ISchema {
    users: { [uid: string]: IUser },
    events: { [eid: string]: IEvent },
    chat: { [rid: string]: IChat },
  }
}
