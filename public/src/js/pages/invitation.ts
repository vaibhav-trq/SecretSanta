
import { SecretSantaEvent } from "../models/events.js";
import { PageTypes, NavigationButtons } from "../models/nav.js";
import { Page } from "../models/page.js";

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
};
