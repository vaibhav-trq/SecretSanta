import { SecretSantaEvent } from "../models/events.js";
import { NavigationButtons, PageTypes } from "../models/nav.js";
import { Page } from "../models/page.js";

export class ErrorEvent404Page extends Page {
  protected readonly buttons_ = new Set([]);
  protected readonly prefix_ = PageTypes.ERROR_EVENT_404;
}

export class ErrorEventAlreadyJoinedPage extends Page {
  protected readonly buttons_ = new Set([NavigationButtons.LOGOUT]);
  protected readonly prefix_ = PageTypes.ERROR_EVENT_ALREADY_JOINED;
  private event_: SecretSantaEvent | undefined;

  protected async setContext(context: any | undefined) {
    this.ASSERT(context instanceof SecretSantaEvent, "Invalid context");
    this.event_ = context;
  }

  protected async pageData() {
    return this.event_!;
  }
}
