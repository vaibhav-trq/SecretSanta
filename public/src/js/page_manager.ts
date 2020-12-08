const { firebase } = window;

import { Page } from "./models/page.js";
import { HomePage } from "./pages/home.js";
import { LoginPage } from "./pages/login.js";
import { ProfilePage } from "./pages/profile.js";
import { NavigationButtons, PageTypes } from "./models/nav.js";
import { IPageManager, IPageManagerInternal } from "./models/page_manager.js";
import { Logger } from "./models/logger.js";


/**
 * PageManager
 * 
 * Top level manager which owns the rendering and page navigation.
 */
export class PageManager extends Logger implements IPageManager, IPageManagerInternal {
  private readonly pages_: Map<PageTypes, Page>;
  private readonly nav_buttons_: Map<NavigationButtons, PageTypes>;
  private readonly recaptchaVerifier_: firebase.default.auth.RecaptchaVerifier;
  private history_: PageTypes[] = [];

  constructor() {
    super();
    this.recaptchaVerifier_ = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
    });
    this.pages_ = new Map([PageTypes.HOME, PageTypes.PROFILE, PageTypes.LOGIN].map(k => {
      return [k, this.createPageInstance(k)];
    }));
    this.nav_buttons_ = new Map([
      [NavigationButtons.HOME, PageTypes.HOME],
      [NavigationButtons.PROFILE, PageTypes.PROFILE],
    ])
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
    await this.swapPage(PageTypes.HOME);
  }

  private registerButtons() {
    this.nav_buttons_.forEach((page, button) => {
      $(`#${button}-button`).on('click', async () => {
        await this.swapPage(page);
      });
    });
    $(`#${NavigationButtons.LOGOUT}-button`).on('click', async () => {
      await firebase.auth().signOut();
    });
  }

  private async swapPage(target: PageTypes) {
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

    await next.render();
  }
};