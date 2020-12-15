const { firebase } = window;

import { DbRoot } from "../models/db.js";
import { SecretSantaEvent } from "../models/events.js";
import { PageTypes, NavigationButtons } from "../models/nav.js";
import { IRenderData, Page } from "../models/page.js";

const JoinEvent = firebase.functions().httpsCallable('joinEvent');

export class InvitationPage extends Page {
  protected readonly prefix_ = PageTypes.INVITATION;
  protected readonly buttons_ = new Set([NavigationButtons.LOGOUT]);
  private key_: string | undefined;
  private event_: SecretSantaEvent | undefined;

  protected async setContext(context: any | undefined) {
    this.ASSERT('event' in context && 'eventId' in context, "Invalid context");

    this.event_ = context;
  }

  protected async pageData() {
    return this.event_!;
  }

  protected async onRender(renderData: IRenderData) {
    const user = firebase.auth().currentUser!;

    const myRsvpQuery = DbRoot.child('users').child(user.uid).child('events').child(this.key_!);

    myRsvpQuery.onDirect('value', (key, item) => {
      if (item) {
        // Participant exists so redirect to main website.
        window.location.href = "/";
      }
    });

    $('button#accept').on('click', async (e) => {
      const name = user.displayName || user.uid;
      await JoinEvent({ eventId: this.key_!, name });
    });
  }
};
