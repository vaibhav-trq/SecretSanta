const { firebase } = window;

import { IParticipant, SecretSantaEvent } from "../models/events.js";
import { PageTypes, NavigationButtons } from "../models/nav.js";
import { IRenderData, Page } from "../models/page.js";

const JoinEvent = firebase.functions().httpsCallable('joinEvent');

export class InvitationPage extends Page {
  protected readonly prefix_ = PageTypes.INVITATION;
  protected readonly buttons_ = new Set([NavigationButtons.LOGOUT]);
  private event_: SecretSantaEvent | undefined;

  protected async setContext(context: any | undefined) {
    this.ASSERT(context instanceof SecretSantaEvent, "Invalid context");
    this.event_ = context;
  }

  protected async pageData() {
    return this.event_!;
  }

  protected async onRender(renderData: IRenderData) {
    console.log("hello")
    const user = firebase.auth().currentUser!;
    const userRsvpRef = firebase.database().ref(`/participants/${this.event_!.key!}/${user.uid}`);

    userRsvpRef.on('value', (snapshot) => {
      const participant: IParticipant | undefined = snapshot.val();
      if (participant) {
        // Participant exists so redirect to main website.
        window.location.href = "/";
      }
    });

    $('button#accept').on('click', async (e) => {
      //check login state here
      const name = user.displayName || user.uid;
      await JoinEvent({ eventId: this.event_!.key!, name });
    });
  }
};
