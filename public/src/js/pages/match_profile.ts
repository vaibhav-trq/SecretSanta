const { firebase } = window;

import { IRenderData, Page } from "../models/page.js";
import { IUserAddress, IUserFavorites, IUserSettings, LoadUserData } from '../models/users.js';
import { NavigationButtons, PageTypes } from "../models/nav.js";
import { IPageManagerInternal } from "../models/page_manager.js";
import { intlTelInput } from "../models/intlTelInput.js";

interface IMatchProfileRenderData extends IRenderData {
  user: Object,
  address: IUserAddress,
  favorites: IUserFavorites,
  settings: IUserSettings,
};

export class MatchProfilePage extends Page {
  protected readonly prefix_ = PageTypes.MATCH_PROFILE;
  protected readonly buttons_ = new Set(Object.values(NavigationButtons));

  constructor(manager: IPageManagerInternal) {
    super(manager);
  }

  protected async pageData(): Promise<IRenderData> {
    const user = firebase.auth().currentUser!;
    const userData = await LoadUserData();
    return { user: user.toJSON(), address: userData.address, favorites: userData.favorites, settings: userData.settings };
  }

  protected async onRender(matchData: IMatchProfileRenderData) {
    const user = firebase.auth().currentUser!;

    const ele = document.querySelector(`#${this.prefix_} [name="number"]`);
    // @ts-expect-error: 2693
    const numberField: intlTelInput = intlTelInput(ele, { 'utilsScript': '/libs/intl-tel-input/js/utils.js' });
    numberField.setNumber(user.phoneNumber || '');

    $('.profile-close').on('click', async () => {
      await this.manager_.back();
    });
  }
};
