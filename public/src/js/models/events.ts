const { firebase } = window;
import { HumanReadableDate } from "../common.js";

export interface IParticipant {
  name: string,
  rsvp: {
    invited_date?: number,
    attending: boolean,
  },
};

/** A secret santa event object. */
interface IEvent {
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

export class SecretSantaEvent implements IEvent {
  name!: string;
  limit!: number;
  host!: string;
  event_host!: string;
  num_participants!: number;
  private!: boolean;
  generated_matches!: boolean;
  created_date!: number;
  updated_date!: number;
  match_date?: number;
  end_date?: number;
  key?: string;

  constructor(hostIdOrKey: string, content?: Object) {
    const user = firebase.auth().currentUser!;
    if (!content) {
      const now = new Date();
      this.name = 'Secret Santa 2020';
      this.limit = -1;
      this.generated_matches = false;
      this.host = hostIdOrKey;
      this.event_host = user.displayName!;
      this.created_date = now.getTime();
      this.updated_date = now.getTime();
      this.num_participants = 0;
      this.private = true;
    } else {
      this.key = hostIdOrKey;
      for (const [key, value] of Object.entries(content)) {
        // @ts-expect-error
        this[key] = value;
      }
    }
  }

  /** Check if user is event host */
  public get is_host() {
    const user = firebase.auth().currentUser!;
    return this.host === user.uid;
  }

  /** Human readable participant summary. */
  public get participant_summary() {
    const ext = (this.num_participants > 1 ? 's' : '');
    return `${this.num_participants} Santa Helper${ext}`;
  }

  /** Updated date in human readable format. */
  public get formatted_updated_date() {
    const d = new Date();
    d.setTime(this.updated_date);
    return HumanReadableDate(d);
  }

  public get host_name() {
    const user = firebase.auth().currentUser!;
    if (user.uid === this.host) {
      return 'You';
    } else {
      return this.event_host;
    }
  }

  /** Created date in human readable format. */
  public get formatted_created_date() {
    const d = new Date();
    d.setTime(this.created_date);
    return HumanReadableDate(d);
  }
};
