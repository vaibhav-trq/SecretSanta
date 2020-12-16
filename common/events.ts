declare namespace common {
  /** A secret santa event object. */
  export interface IEventMetadata {
    /** Event Name */
    name: string,
    /** Host UID. */
    host: string,
    /** Max number of attendees. */
    limit: number,
    /** Host Name */
    event_host: string;
    /** Time of creation. */
    created_date: number,
    /** Last update time. */
    updated_date: number,
    /** Number of participants. */
    num_participants: number,
    /** Once true, no more guests can join the event. */
    generated_matches: boolean,
    /** Day matches are revealed. */
    end_date: number,
  }

  export interface IParticipant {
    name: string,
    rsvp: {
      invited_date: number,
      attending: boolean,
    },
  }

  export interface IRsvpList {
    [uid: string]: IParticipant,
  }

  export interface IMatch {
    /** Details about a users santa */
    santa: { rid: string },
    /** Details about a users santa */
    giftee: {
      name: string,
      uid: string,
      rid: string,
    },
  }

  export interface IEvent {
    /** Metadata for an events. */
    metadata: IEventMetadata,

    /** RSVP's for an events. */
    rsvps?: IRsvpList,

    /** Match information for every user. */
    matches?: { [uid: string]: IMatch },
  }
}
