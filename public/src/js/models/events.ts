const { firebase } = window;
import { HumanReadableDate } from "../common.js";

/** A secret santa event object. */
interface IEvent {
  /** Event Name */
  name: string,
  /** Max number of attendees. */
  limit: number,
  /** Host UID. */
  host: string,
  /** Time of creation. */
  created_date: number,
  /** Last update time. */
  updated_date: number,
  /** All participants for the event. */
  participants: string[],
  /** Participants which are invited to an event. */
  invited: string[],
  /** Is the event invite only (invite via URL). */
  private: boolean,
  /** Once true, no more guests can join the event. */
  generated_matches: boolean,
  /** Day matches are generated. After this time, no more people can join the secret santa. */
  match_date?: number,
  /** Day matches are revealed. */
  end_date?: number,
};

export class Event implements IEvent {
  name!: string;
  limit!: number;
  host!: string;
  participants!: string[];
  invited!: string[];
  private!: boolean;
  generated_matches!: boolean;
  created_date!: number;
  updated_date!: number;
  match_date?: number;
  end_date?: number;
  key?: string;

  constructor(hostIdOrKey: string, content?: Object) {
    if (!content) {
      const now = new Date();
      this.name = 'Secret Santa 2020';
      this.limit = -1;
      this.generated_matches = false;
      this.host = hostIdOrKey;
      this.created_date = now.getTime();
      this.updated_date = now.getTime();
      this.participants = [hostIdOrKey];
      this.invited = [];
      this.private = true;
    } else {
      this.key = hostIdOrKey;
      for (const [key, value] of Object.entries(content)) {
        // @ts-expect-error
        this[key] = value;
      }
    }
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
      return 'Event Host'
    }
  }

  /** Created date in human readable format. */
  public get formatted_created_date() {
    const d = new Date();
    d.setTime(this.created_date);
    return HumanReadableDate(d);
  }
};
