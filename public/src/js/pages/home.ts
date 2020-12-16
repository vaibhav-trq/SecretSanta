const { firebase } = window;

import { NavigationButtons, PageTypes } from "../models/nav.js";
import { IRenderData, Page } from "../models/page.js";
import { RenderTemplate } from "../common.js";
import { SecretSantaEvent } from "../models/events.js"
import { IPageManagerInternal } from "../models/page_manager.js";
import { DbRoot, QueryBuilder } from "../models/db.js";

interface IHomePageRenderData extends IRenderData, Object { };

export class HomePage extends Page {
  protected readonly buttons_ = new Set(Object.values(NavigationButtons));
  protected readonly prefix_ = PageTypes.HOME;
  protected listeners_: Map<string, QueryBuilder<any>> = new Map();

  constructor(manager: IPageManagerInternal) {
    super(manager);
  }

  protected async pageData(): Promise<IHomePageRenderData> {
    const user = firebase.auth().currentUser!;
    return user.toJSON();
  }

  protected async onRender(_renderData: IHomePageRenderData) {
    const user = firebase.auth().currentUser!;
    const rspvQuery = DbRoot.child('users').child(user.uid).child('events');
    this.listeners_.set(rspvQuery.ref.toString(), rspvQuery);

    // Get all the rsvp's the user is.
    rspvQuery.onDirect('child_added', (eid, rsvpData) => {
      this.addNewEventRsvp(eid);
    });
    rspvQuery.onDirect('child_removed', (eid, rsvpData) => {
      this.removeEventRsvp(eid);
    });

    // Register on page buttons.
    $('#createEvent').on('click', async () => {
      await this.createHostedEvent();
    });
  }

  onExit() {
    const user = firebase.auth().currentUser!;

    // Stop listening to rsvp updates.
    const rsvpQuery = DbRoot.child('users').child(user.uid).child('events');
    rsvpQuery.off();

    // Stop listening to event updates.
    this.listeners_.forEach(query => {
      query.off();
    })
    this.listeners_.clear();
  }

  private addNewEventRsvp(eventId: string) {
    const eventsDom = $('#events');
    // const rsvp: SecretSanta.IUserRsvp = rsvpData.val();
    const e = RenderTemplate('event-wrapper', null, { eventId });
    eventsDom.prepend(e);

    // Listen for updates on each event.
    const eventQuery = DbRoot.child('events').child(eventId).child('metadata');
    eventQuery.onDirect('value', (key, event) => {
      const eventDom = this.createEventDom(eventId, new SecretSantaEvent(event.host, event));
      e.find('.content').replaceWith(eventDom);
    });
    this.listeners_.set(eventId, eventQuery);
  }

  private removeEventRsvp(eventId: string) {
    const eventsDom = $('#events');

    // Stop listening to updates.
    const query = this.listeners_.get(eventId);
    this.listeners_.delete(eventId);

    query!.off();
    eventsDom.find(`#preview-eid-${eventId}`).remove();
  }

  private createEventDom(eid: string, event: SecretSantaEvent) {
    const ele = RenderTemplate('event', null, event);
    const target = (event.generated_matches) ? PageTypes.MATCH : PageTypes.EVENT_DETAILS;
    ele.on('click', async () => {
      await this.manager_.swapPage(target, { event, key: eid });
    });
    return ele;
  }

  public async createHostedEvent() {
    const user = firebase.auth().currentUser!;
    const event = new SecretSantaEvent(user.uid);
    await DbRoot.child('events').push({ metadata: event });
  }
};
