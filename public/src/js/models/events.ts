const { firebase } = window;

import { HumanReadableDate } from "../common.js";

const GetNextXMas = () => {
  const today = new Date();
  const xmas = new Date(today.getFullYear(), 11, 25);
  if (today.getMonth() === 11 && today.getDate() > 25) {
    xmas.setFullYear(xmas.getFullYear() + 1);
  }
  return xmas;
};

const GetOrDefault = (item: SecretSanta.IEventMetadata | undefined, field: keyof SecretSanta.IEventMetadata, _default: any) => {
  if (item) {
    return item[field];
  }
  return _default;
};

const Month: { [idx: number]: string } = {
  0: 'January',
  1: 'February',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December',
};

export class SecretSantaEvent implements SecretSanta.IEventMetadata {
  /** Event Name */
  name: string;
  /** Host UID. */
  host: string;
  /** Max number of attendees. */
  limit: number;
  /** Host Name */
  event_host: string;
  /** Time of creation. */
  created_date: number;
  /** Last update time. */
  updated_date: number;
  /** Number of participants. */
  num_participants: number;
  /** Once true, no more guests can join the event. */
  generated_matches: boolean;
  /** Day matches are revealed. */
  end_date: number;

  constructor(hostId: string, content?: SecretSanta.IEventMetadata) {
    const user = firebase.auth().currentUser!;
    const now = new Date();

    this.name = GetOrDefault(content, 'name', 'Secret Santa 2020');
    this.limit = GetOrDefault(content, 'limit', -1);
    this.generated_matches = GetOrDefault(content, 'generated_matches', false);
    this.host = GetOrDefault(content, 'host', hostId);
    this.event_host = GetOrDefault(content, 'event_host', user.displayName!);
    this.created_date = GetOrDefault(content, 'created_date', now.getTime());
    this.updated_date = GetOrDefault(content, 'updated_date', now.getTime());
    this.num_participants = GetOrDefault(content, 'num_participants', 0);
    this.end_date = GetOrDefault(content, 'end_date', GetNextXMas().getTime());
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

  public get formatted_event_date() {
    const d = new Date();
    d.setTime(this.end_date);
    const day = `${d.getDay()}`.padStart(2, '0')
    return `${day}<br/>${Month[d.getMonth()]}`;
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
