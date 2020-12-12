const { firebase } = window;
import { HumanReadableDate } from "../common.js";

interface IParticipant {
  uid: string,
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
  /** All participants for the event. */
  participants: IParticipant[],
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

export class SecretSantaEvent implements IEvent {
  name!: string;
  limit!: number;
  host!: string;
  event_host!: string;
  participants!: IParticipant[];
  invited!: string[];
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
      this.participants = [{
        name: user.displayName || "Default Name",
        uid: hostIdOrKey,
        rsvp: {
          attending: true,
        },
      }];
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

  /** Human readable participant summary. */
  public get participant_summary() {
    const ext = (this.participants.length > 1 ? 's' : '');
    return `${this.participants.length} Santa Helper${ext}`;
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
