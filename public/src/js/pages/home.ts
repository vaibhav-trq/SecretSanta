const { firebase } = window;

import { NavigationButtons, PageTypes } from "../models/nav.js";
import { IRenderData, Page } from "../models/page.js";
import { RenderTemplate } from "../common.js";
import { Event } from "../models/events.js"
import { IPageManagerInternal } from "../models/page_manager.js";

interface IHomePageRenderData extends IRenderData, Object { };

export class HomePage extends Page {
  protected readonly buttons_ = new Set([NavigationButtons.PROFILE, NavigationButtons.LOGOUT]);
  protected readonly prefix_ = PageTypes.HOME;
  private readonly eventRef_ = firebase.database().ref('/events');

  constructor(manager: IPageManagerInternal) {
    super(manager);
  }

  protected async pageData(): Promise<IHomePageRenderData> {
    const user = firebase.auth().currentUser!;
    return user.toJSON();
  }

  protected async onRender(_renderData: IHomePageRenderData) {
    // Start listening to changes.
    const user = firebase.auth().currentUser!;
    this.eventRef_.orderByChild('host').equalTo(user.uid).on('value', (snapshot) => {
      const eventDom = $('#events');

      // Clear the event dom.
      eventDom.children().not(':first').remove();

      // TODO: Events should be sorted by most recent first.
      snapshot.forEach(eventData => {
        const event = new Event(eventData.key!, eventData.val());
        // Draw each event dom.
        eventDom.append(this.createEventDom(event));
      });
    });

    // Register on page buttons.
    $('#createEvent').on('click', async () => {
      await this.createHostedEvent();
    });
  }

  onExit() {
    // Stop listening to event updates.
    this.eventRef_.off('value');
  }

  private createEventDom(event: Event) {
    return RenderTemplate('event', $('<div></div>'), event);
  }

  public async createHostedEvent() {
    const user = firebase.auth().currentUser!;
    const event = new Event(user.uid);
    await firebase.database().ref('/events').push(event);
  }
};