const { firebase } = window;

import { PageTypes, NavigationButtons } from "../models/nav.js";
import { IRenderData, Page } from "../models/page.js";
import { IParticipant, SecretSantaEvent } from "../models/events.js";
import { RenderTemplate } from "../common.js";
import { AddMessage, GetErrorMessage } from "../common.js";

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
  protected readonly participantsRef_ = firebase.database().ref('/participants');

  protected async onRender(renderData: IRenderData) {
    const participantsRef = this.participantsRef_.child(this.event_!.key!);
    participantsRef.on('value', (snapshot) => {
      const no_rsvp = $("#naughty-participants .names");
      const yes_rsvp = $("#nice-participants .names");
      no_rsvp.html('');
      yes_rsvp.html('');
      snapshot.forEach(ele => {
        // const uid = ele.key!;
        const participants: IParticipant = ele.val();
        const targetDom = participants.rsvp.attending ? yes_rsvp : no_rsvp;
        RenderTemplate("event-participant", targetDom, participants);
      });
      $("#naughty-participants h6 span").text(`(${no_rsvp.children().length})`);
      $("#nice-participants h6 span").text(`(${yes_rsvp.children().length})`);
    });

    $('#draw-names-button').on('click', async () => {
      await this.manager_.swapPage(PageTypes.MATCH, this.event_!);
    });
    $('#rsvp').on('change', async (e) => {
      await this.updateRSVP($(e.target));
    });
    $('#invite-link-button').on('click', async (e) => {
      const selBox = document.createElement('textarea');
      selBox.value = `${document.location.origin}/join/${this.event_!.key!}`;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);
      AddMessage($(e.target), "Invite link copied to clipboard", true);
    });
  }

  private async updateRSVP(element: JQuery<HTMLElement>) {
    const checked = element.prop('checked');
    try {
      if (checked) {
        this.LOG("box is checked!")
        AddMessage(element, 'Thanks for confirming your attendance!', true);
      } else {
        this.LOG("box is unchecked!")
        AddMessage(element, 'You haven\'t RSVP\'d yet!', true);
      }
    } catch (e) {
      AddMessage(element, GetErrorMessage(e));
      element.prop('checked', !checked);
    }
  };
}
