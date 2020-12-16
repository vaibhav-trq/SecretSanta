const { firebase } = window;

import { PageTypes, NavigationButtons } from "../models/nav.js";
import { Page } from "../models/page.js";
import { DbRoot } from "../models/db.js";

export class MatchPage extends Page {
  protected readonly prefix_ = PageTypes.MATCH;
  protected readonly buttons_ = new Set<NavigationButtons>(Object.values(NavigationButtons));

  protected key_?: string;

  protected async setContext(context: any | undefined) {
    if (typeof context === "string") {
      this.key_ = context;
    }
    this.ASSERT(typeof this.key_ === "string", "Key must be set");
  }

  protected async pageData(): Promise<SecretSanta.IMatch> {
    const user = firebase.auth().currentUser!;
    const [, match] = await DbRoot.child('events').child(this.key_!).child('matches').child(user.uid).once();
    // TODO: Remove default match.
    return match || {
      santa: { rid: "default" },
      giftee: { name: "My Giftee's name", uid: "GifteeUID", rid: "default" },
    };
  }

  protected async onRender(matchInfo: SecretSanta.IMatch) {
    $('#match-profile-button').on('click', async () => {
      await this.manager_.swapPage(PageTypes.MATCH_PROFILE);
    });
  }
}
