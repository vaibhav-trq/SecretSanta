const { firebase } = window;

import { PageTypes, NavigationButtons } from "../models/nav.js";
import { IRenderData, Page } from "../models/page.js";
import { SecretSantaEvent } from "../models/events.js";

interface IMatchContext extends IRenderData {
  match: {
    /** UID of your match. */
    id: string,
    /** Match name. */
    name: string,
    /** UID of chat room. */
    chatRoomId: string,
  },
  santa: {
    // The UID and name are not present here as all data is hidden and acled.
    /** UID of chat room. */
    chatRoomId: string,
  }
};

abstract class PageWithEventContext extends Page {
  protected readonly matchRef_ = firebase.database().ref('/matches');
  protected event_: SecretSantaEvent | undefined;

  protected async setContext(context: any | undefined) {
    if (context) {
      // Preserve context if the back button is pressed.
      this.ASSERT(context instanceof SecretSantaEvent, `Provided invalid context: ${typeof context} !== ${typeof SecretSantaEvent}`);
      this.event_ = context;
    }
  }
};

// TODO(#32): @vaibhav-trq remove this after DB support.
// Only for testing while the DB doesn't support this.
const defaultMatch: IMatchContext = {
  match: {
    id: "asfasdf",
    name: "Random Name",
    chatRoomId: "chatRoomId0",
  },
  santa: {
    chatRoomId: "chatRoomId1",
  },
};

export class MatchPage extends PageWithEventContext {
  protected readonly prefix_ = PageTypes.MATCH;
  protected readonly buttons_ = new Set<NavigationButtons>(Object.values(NavigationButtons));

  protected async pageData(): Promise<IMatchContext> {
    const user = firebase.auth().currentUser!;
    const content = await this.matchRef_.child(user.uid).child(this.event_!.key!).once('value');
    return content.val() || defaultMatch;
  }

  protected async onRender(eventInfo: IMatchContext) {
    $('#match-profile-button').on('click', async () => {
      await this.manager_.swapPage(PageTypes.MATCH_PROFILE);
    });
  }
}

export class EventDetailsPage extends PageWithEventContext {
  protected readonly prefix_ = PageTypes.EVENT_DETAILS;
  protected readonly buttons_ = new Set<NavigationButtons>(Object.values(NavigationButtons));

  protected async pageData() {
    // Participants that RSVP'ed yes.
    const nice = this.event_!.participants.filter(p => p.rsvp.attending);
    // Participants that RSVP'ed no.
    const naughty = this.event_!.participants.filter(p => !p.rsvp.attending);
    return {
      nice,
      naughty,
    }
  }

  protected async onRender(renderData: IRenderData) {
    $('#draw-names-button').on('click', async () => {
      await this.manager_.swapPage(PageTypes.MATCH, this.event_!);
    });
  }
}
