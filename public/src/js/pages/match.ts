import { PageTypes, NavigationButtons } from "../models/nav.js";
import { IRenderData, Page } from "../models/page.js";

export class MatchPage extends Page {
  protected readonly prefix_ = PageTypes.MATCH;
  protected readonly buttons_ = new Set<NavigationButtons>(Object.values(NavigationButtons));

  protected async onRender(renderData: IRenderData) {
    $('#match-profile-button').on('click', async () => {
      await this.manager_.swapPage(PageTypes.MATCH_PROFILE);
    });
  }
}

export class EventDetailsPage extends Page {
  protected readonly prefix_ = PageTypes.EVENT_DETAILS;
  protected readonly buttons_ = new Set<NavigationButtons>(Object.values(NavigationButtons));

  protected async onRender(renderData: IRenderData) {
    $('#draw-names-button').on('click', async () => {
      await this.manager_.swapPage(PageTypes.MATCH);
    });
    $('#invite-link-button').on('click', async () => {
      let eventLink = "www.eventURL.com/" + ""
      let selBox = document.createElement('textarea');
      selBox.value = eventLink;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);
    });
  }
}
