import { PageTypes, NavigationButtons } from "../models/nav.js";
import { Page } from "../models/page.js";

export class MatchPage extends Page {
  protected readonly prefix_ = PageTypes.MATCH;
  protected readonly buttons_ = new Set<NavigationButtons>(Object.values(NavigationButtons));
}

export class EventDetailsPage extends Page {
  protected readonly prefix_ = PageTypes.EVENT_DETAILS;
  protected readonly buttons_ = new Set<NavigationButtons>(Object.values(NavigationButtons));
}
