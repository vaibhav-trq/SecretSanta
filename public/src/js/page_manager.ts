const { firebase } = window;

import { Page } from "./models/page.js";
import { HomePage } from "./pages/home.js";
import { LoginPage } from "./pages/login.js";
import { ProfilePage } from "./pages/profile.js";
import { ButtonToPage, NavigationButtons, PageTypes } from "./models/nav.js";
import { IPageManager, IPageManagerInternal } from "./models/page_manager.js";
import { Logger } from "./models/logger.js";
import { MatchProfilePage } from "./pages/match_profile.js";
import { EventDetailsPage, MatchPage } from "./pages/match.js";


/**
 * PageManager
 * 
 * Top level manager which owns the rendering and page navigation.
 */
export class PageManager extends Logger implements IPageManager, IPageManagerInternal {
  private readonly pages_: Map<PageTypes, Page>;
  private readonly recaptchaVerifier_: firebase.default.auth.RecaptchaVerifier;
  private history_: PageTypes[] = [];

  constructor() {
    super();
    this.recaptchaVerifier_ = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
    });
    this.pages_ = new Map(Object.values(PageTypes).map(k => {
      return [k, this.createPageInstance(k)];
    }));
    this.registerButtons();
  }

  private createPageInstance(page: PageTypes): Page {
    switch (page) {
      case PageTypes.HOME:
        return new HomePage(this);
      case PageTypes.LOGIN:
        return new LoginPage(this);
      case PageTypes.PROFILE:
        return new ProfilePage(this, this.recaptchaVerifier_);
      case PageTypes.MATCH_PROFILE:
        return new MatchProfilePage(this);
      case PageTypes.MATCH:
        return new MatchPage(this);
      case PageTypes.EVENT_DETAILS:
        return new EventDetailsPage(this);
      default:
        throw new Error(`Unsupported PageType: ${page}`);
    }
  };

  async onLogout() {
    this.LOG('onLogout');
    await this.swapPage(PageTypes.LOGIN);
  }

  async onLogin() {
    this.LOG('onLogin');
    await this.swapPage(PageTypes.HOME);
  }

  async back() {
    // TODO: Implement true history.
    this.LOG('onBack');
    if (this.history_.length > 1) {
      await this.swapPage(this.history_[this.history_.length - 2]);
    } else {
      await this.swapPage(PageTypes.HOME);
    }
  }

  private registerButtons() {
    ButtonToPage.forEach((page, button) => {
      $(`#${button}-button`).on('click', async () => {
        await this.swapPage(page);
      });
      this.LOG("Registered:", button, "=>", page);
    });
    $(`#${NavigationButtons.LOGOUT}-button`).on('click', async () => {
      await firebase.auth().signOut();
    });
  }

  async swapPage(target: PageTypes, context: any | undefined = undefined) {
    this.LOG('Swapping to:', target);
    const next = this.pages_.get(target);
    if (!next) {
      throw new Error(`Tried swapping to unknown page: ${target}`);
    }

    if (this.history_.length > 0) {
      const prev = this.history_[this.history_.length - 1];
      this.LOG('Swapping from:', prev);
      this.pages_.get(prev)!.onExit();
    }

    if (target === PageTypes.HOME) {
      this.history_ = [];
    } else {
      this.history_.push(target);
    }

    await next.render(context);
  }
};
