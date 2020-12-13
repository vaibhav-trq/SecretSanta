/** A secret santa event object. */
export interface IEvent {
  /** Event Name */
  name: string,
  /** Max number of attendees. */
  limit: number,
  /** Host UID. */
  host: string,
  /** Host Name */
  event_host: string;
  /** Time of creation. */
  created_date: number,
  /** Last update time. */
  updated_date: number,
  /** Number of participants. */
  num_participants: number,
  /** Is the event invite only (invite via URL). */
  private: boolean,
  /** Once true, no more guests can join the event. */
  generated_matches: boolean,
  /** Day matches are generated. After this time, no more people can join the secret santa. */
  match_date?: number,
  /** Day matches are revealed. */
  end_date?: number,
};

export interface IParticipant {
  name: string,
  rsvp: {
    invited_date?: number,
    attending: boolean,
  },
};
