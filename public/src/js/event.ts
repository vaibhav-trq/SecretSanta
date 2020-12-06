import { HumanReadableDate, RenderTemplate } from "./common.js";

const { firebase } = window;

interface IEvent {
  name: string, // Event name.
  limit: number, // Max number of attendees.
  host: string, // Host UID.
  created_date: number, // Time of creation.
  updated_date: number, // Last update time.
  participants: string[], // All participants for the event.
  invited: string[], // Participants which are invited to an event.
  private: boolean, // Is the event invite only (invite via URL).
  generated_matches: boolean, // Once true, no more guests can join the event.
  match_date?: number, // Day matches are generated. After this time, no more people can join the secret santa.
  end_date?: number, // Day matches are revealed.
};

class Event implements IEvent {
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

  public get formatted_updated_date() {
    const d = new Date();
    d.setTime(this.updated_date);
    return HumanReadableDate(d);
  }

  public get host_name() {
    const d = new Date();
    d.setTime(this.updated_date);
    return HumanReadableDate(d);
  }

  public get formatted_created_date() {
    const d = new Date();
    d.setTime(this.created_date);
    return HumanReadableDate(d);
  }
};

export class EventManager {
  eventRef: firebase.default.database.Reference;
  element: JQuery<HTMLElement>

  constructor(eventDom: JQuery<HTMLElement>) {
    this.eventRef = firebase.database().ref('/events');
    this.element = eventDom;
    this.listenForHostedEvent();
  }

  // This kills all the listeners which wait on this.
  public terminate() {
    // Disable all listeners.
    this.eventRef.off('value');
  };

  public async createHostedEvent() {
    const user = firebase.auth().currentUser!;
    const event = new Event(user.uid);
    await firebase.database().ref('/events').push(event);
  }

  private listenForHostedEvent() {
    const user = firebase.auth().currentUser!;
    this.eventRef.orderByChild('host').equalTo(user.uid).on('value', (snapshot) => {
      this.element.html('');
      snapshot.forEach((data) => {
        this.createEventDom(new Event(data.key!, data.val()));
      });
    });
  };

  private createEventDom(event: Event) {
    const ele = $('<div></div>');
    RenderTemplate('event', ele, event);
    ele.appendTo(this.element);
  }
}
