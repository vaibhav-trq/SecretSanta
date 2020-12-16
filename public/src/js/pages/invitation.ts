const { firebase } = window;

import { DbRoot } from "../models/db.js";
import { SecretSantaEvent } from "../models/events.js";
import { PageTypes } from "../models/nav.js";
import { IRenderData, Page } from "../models/page.js";

const JoinEvent = firebase.functions().httpsCallable('joinEvent');

export class InvitationPage extends Page {
  protected readonly prefix_ = PageTypes.INVITATION;
  protected readonly buttons_ = new Set([]);
  private key_: string | undefined;
  private event_: SecretSantaEvent | undefined;
  private visited_ = false;

  protected async setContext(context: any | undefined) {
    this.ASSERT('event' in context && 'eventId' in context, "Invalid context");
    this.key_ = context.eventId;
    this.event_ = new SecretSantaEvent(context.event);
  }

  protected async pageData() {
    return this.event_!;
  }

  protected async JoinEvent() {
    const user = firebase.auth().currentUser!;
    await JoinEvent({ eventId: this.key_!, name: user.displayName || user.uid });
    window.location.href = "/";
  }

  protected async onRender(renderData: IRenderData) {
    const user = firebase.auth().currentUser;
    if (user) {
      const myRsvpQuery = DbRoot.child('users').child(user.uid).child('events').child(this.key_!);
      const [, item] = await myRsvpQuery.once();
      if (item) {
        // Participant is already part of the event, so show different page.
        setTimeout(async () => {
          await this.manager_.swapPage(PageTypes.ERROR_EVENT_ALREADY_JOINED, this.event_)
        }, 0);
        return;
      }

      // On the second render auto join the event.
      if (this.visited_) {
        await this.JoinEvent();
      }
    }

    $('button#accept').on('click', async (e) => {
      // Main entry point is based on firebase auth.
      if (user) {
        await this.JoinEvent();
      } else {
        await this.manager_.swapPage(PageTypes.LOGIN);
      }
    });
    setTimeout(() => this.OpenLetter(), 400);
    this.visited_ = true;
  }

  protected OpenLetter() {
    const flip = $('.cover');
    const letter = $('.letter');
    flip.addClass('open');
    flip.removeClass('close');

    setTimeout(() => {
      letter.addClass('readLetter');
      letter.addClass('letterOpen');
      letter.removeClass('letterClose');
    }, 1000);
  }
};
