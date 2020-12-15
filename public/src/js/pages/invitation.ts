const { firebase } = window;

import { IParticipant, SecretSantaEvent } from "../models/events.js";
import { PageTypes } from "../models/nav.js";
import { IRenderData, Page } from "../models/page.js";
import { PageManager } from "../page_manager.js";

const JoinEvent = firebase.functions().httpsCallable('joinEvent');

export class InvitationPage extends Page {
  protected readonly prefix_ = PageTypes.INVITATION;
  protected readonly buttons_ = new Set([]);
  private event_: SecretSantaEvent | undefined;

  protected async setContext(context: any | undefined) {
    this.ASSERT(context instanceof SecretSantaEvent, "Invalid context");
    this.event_ = context;
  }

  protected async pageData() {
    return this.event_!;
  }

  protected async onRender(renderData: IRenderData) {
    $('button#accept').on('click', async (e) => {
      const manager = new PageManager([PageTypes.LOGIN, PageTypes.INVITATION], PageTypes.INVITATION);
      // Main entry point is based on firebase auth.
      firebase.auth().onAuthStateChanged(async loggedInState => {
        if (loggedInState) {
          // Some user is logged in.
          await manager.onLogin(this.event_);
          this.joinEventSafely();

        } else {
          await manager.swapPage(PageTypes.LOGIN, this.event_);
          this.joinEventSafely();
          //await manager.onLogout();
        }
      });
    });
  }

  private joinEventSafely() {
    const user = firebase.auth().currentUser!;
    const userRsvpRef = firebase.database().ref(`/participants/${this.event_!.key!}/${user.uid}`);

    userRsvpRef.on('value', (snapshot) => {
      const participant: IParticipant | undefined = snapshot.val();
      if (participant) {
        console.log("participant exists - redirecting")
        // Participant exists in the event so redirect to main website.
        window.location.href = "/";
      }
      else {
        console.log("logged in participant wants to join event")
        const name = user.displayName || user.uid;
        JoinEvent({ eventId: this.event_!.key!, name });
      }
    });
  }
};
