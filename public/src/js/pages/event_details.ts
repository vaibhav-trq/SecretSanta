const { firebase } = window;

import { RenderTemplate, AddMessage, GetErrorMessage } from "../common.js";
import { DbRoot } from "../models/db.js";
import { SecretSantaEvent } from "../models/events.js";
import { PageTypes, NavigationButtons } from "../models/nav.js";
import { Page } from "../models/page.js";

interface EventDetailsContext {
  key: string,
  event: SecretSantaEvent,
};

const IsEventDetailsContext = (obj: any): obj is EventDetailsContext => {
  return 'key' in obj && 'event' in obj;
}

export class EventDetailsPage extends Page {
  protected readonly prefix_ = PageTypes.EVENT_DETAILS;
  protected readonly buttons_ = new Set<NavigationButtons>(Object.values(NavigationButtons));

  protected context_: EventDetailsContext | undefined;

  protected async setContext(context: any | undefined) {
    if (IsEventDetailsContext(context)) {
      // Preserve context if the back button is pressed.
      this.context_ = context;
    }
    this.ASSERT(IsEventDetailsContext(this.context_), "Event is not appropriate.");
  }

  protected async pageData(): Promise<SecretSantaEvent> {
    return this.context_!.event;
  }

  protected async onRender(renderData: SecretSantaEvent) {
    const user = firebase.auth().currentUser!;

    const myRsvpQuery = DbRoot.child('users').child(user.uid).child('events').child(this.context_!.key).child('attending');
    const participantsQuery = DbRoot.child('events').child(this.context_!.key).child('rsvps');

    const [, attending] = await myRsvpQuery.once();
    $('#rsvp').prop("checked", attending);

    const no_rsvp = $("#naughty-participants");
    const yes_rsvp = $("#nice-participants");
    participantsQuery.on('value', (uid, participant) => {
      const targetDom = (participant.rsvp.attending ? yes_rsvp : no_rsvp).find('.names');
      targetDom.append(RenderTemplate("event-participant", null, participant));
    }, () => {
      $('.names').html('');
    }, () => {
      no_rsvp.find("h6 span").text(`(${no_rsvp.find('.names').children().length})`);
      $("#nice-participants h6 span").text(`(${yes_rsvp.find('.names').children().length})`);
    });

    $('#draw-names-button').on('click', async () => {
      await this.manager_.swapPage(PageTypes.MATCH, this.context_!.key);
    });
    $('#rsvp').on('change', async (e) => {
      await this.updateRSVP($(e.target));
    });
    $('#invite-link-button').on('click', async (e) => {
      const selBox = document.createElement('textarea');
      selBox.value = `${document.location.origin}/join/${this.context_!.key}`;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);
      AddMessage($(e.target), "Invite link copied to clipboard", true);
    });
  }

  private async updateRSVP<T>(element: JQuery<HTMLElement>) {
    const user = firebase.auth().currentUser!;

    const checked = element.prop('checked');
    const myRsvpQuery =
      DbRoot.child('users').child(user.uid)
        .child('events').child(this.context_!.key).child('attending');

    const message = checked ? "We'll see you there!" : "You'll be missed :(";
    try {
      await myRsvpQuery.set(checked);
      AddMessage(element, message, true);
    } catch (e) {
      AddMessage(element, GetErrorMessage(e));
      element.prop('checked', !checked);
    }
  };
}
