const { firebase } = window;

import { IRenderData, Page } from "../models/page.js";
import { IUserAddress, IUserSettings, LoadUserData } from '../models/users.js';
import { NavigationButtons, PageTypes } from "../models/nav.js";
import { GetErrorMessage } from "../common.js";
import { IPageManagerInternal } from "../models/page_manager.js";

interface IProfileRenderData extends IRenderData {
  user: Object,
  address: IUserAddress,
  settings: IUserSettings,
};

const GetOriginalValue = (attr: string): string => {
  const user = firebase.auth().currentUser!;

  if (attr === 'displayName') {
    return user.displayName || '';
  } else if (attr === 'number') {
    return user.phoneNumber || '';
  }
  return '';
};

const AddMessage = (element: JQuery<HTMLElement>, message: string, success: boolean = false) => {
  const msg = $(`<h5><small class="font-weight-bold">${message}</small></h5>`);
  msg.addClass(success ? 'text-success' : 'text-danger');
  msg.insertAfter(element.parent()).delay(success ? 1000 : 5000).queue(() => msg.remove());
}

interface intlTelInput {
  setNumber(number: string): void;
  getNumber(): string;
};

export class ProfilePage extends Page {
  protected readonly prefix_ = PageTypes.PROFILE;
  protected readonly buttons_ = new Set([NavigationButtons.HOME, NavigationButtons.LOGOUT]);

  private numberField_: intlTelInput | undefined;
  private readonly recaptchaVerifier_: firebase.default.auth.RecaptchaVerifier;

  constructor(manager: IPageManagerInternal, recaptchaVerifier: firebase.default.auth.RecaptchaVerifier) {
    super(manager);
    this.recaptchaVerifier_ = recaptchaVerifier;
  }

  protected async pageData(): Promise<IRenderData> {
    const user = firebase.auth().currentUser!;
    const userData = await LoadUserData();
    return { user: user.toJSON(), address: userData.address, settings: userData.settings };
  }

  protected async onRender(userData: IProfileRenderData) {
    const user = firebase.auth().currentUser!;

    // Update the profile.
    if (user.phoneNumber) {
      $('#notifications').removeAttr('disabled');
      if (userData.settings?.text_notifications) {
        $('#notifications').prop("checked", true);
      }
    }

    // @ts-expect-error: 2693
    this.numberField_ = intlTelInput(document.querySelector('#profile [name="number"]'), {
      'utilsScript': '/libs/intl-tel-input/js/utils.js',
    });
    this.numberField_!.setNumber(user.phoneNumber || '');

    if (user.email) {
      const emailBadge = $('#profile [name="email"]').parent().find('.badge');
      if (user.emailVerified) {
        emailBadge.addClass('badge-success');
        emailBadge.html('Verified');
      } else {
        emailBadge.addClass('badge-danger');
        emailBadge.html('Unverified');
      }
    }

    // Register on page buttons.
    $('#notifications').on('change', async (e) => {
      await this.updateTextNotification($(e.target));
    });
    $('#profile-form input:not([readonly])').on('keypress', async (e) => {
      if (e.key === "Enter") {
        await this.updateUser($(e.target));
      }
    });
    $('#address-form input:not([readonly])').on('keypress', async (e) => {
      if (e.key === "Enter") {
        await this.updateAddressData($(e.target));
      }
    });

    $('.profile-close').on('click', async () => {
      await this.manager_.back();
    });
  }


  private async updateTextNotification(element: JQuery<HTMLElement>) {
    const user = firebase.auth().currentUser!;
    const ref = firebase.database().ref(`users/${user.uid}/settings`);
    const checked = element.prop('checked');
    try {
      if (checked) {
        if (!user.phoneNumber) {
          return AddMessage(element, 'No phone number on record.');
        }
        await ref.update({ text_notifications: user.phoneNumber });
        AddMessage(element, 'Enabled text messages.', true);
      } else {
        await ref.update({ text_notifications: null });
        AddMessage(element, 'Disabled text messages.', true);
      }
    } catch (e) {
      AddMessage(element, GetErrorMessage(e));
      element.prop('checked', !checked);
    }
  };

  private async updateAddressData(element: JQuery<HTMLElement>) {
    const user = firebase.auth().currentUser!;
    const ref = firebase.database().ref(`users/${user.uid}/address`);

    const attr = element.attr('name')!;
    const value = element.val()?.toString() || '';
    try {
      await ref.update({ [attr]: value });
      AddMessage(element, 'Updated!', true);
    } catch (e) {
      AddMessage(element, GetErrorMessage(e));
      const orig = await LoadUserData();
      element.val(orig.address[attr]);
    }
  }


  private async updateUser(element: JQuery<HTMLElement>) {
    const user = firebase.auth().currentUser!;
    const attr = element.attr('name')!;
    const value = element.val()?.toString() || '';

    const orig = GetOriginalValue(attr);
    if (orig === value) {
      return;
    }

    try {
      if (attr === 'displayName') {
        await user.updateProfile({ [attr]: value });
        AddMessage(element, 'Name updated.', true);
      } else if (attr === 'number') {
        await this.updateNumber(element);
      }
    } catch (e) {
      AddMessage(element, GetErrorMessage(e));
      element.val(orig);
    }
  };

  private async updateNumber(element: JQuery<HTMLElement>) {
    const user = firebase.auth().currentUser!;

    const number = this.numberField_!.getNumber();
    if (number === user.phoneNumber) {
      return;
    }

    try {
      if (!number) {
        await user.unlink(firebase.auth.PhoneAuthProvider.PROVIDER_ID);
        $('#notifications').prop("checked", false);
        $('#notifications').attr('disabled', '');
        return AddMessage(element, 'Phone number removed.', true);
      } else {
        const authCred = await this.getPhoneCredential(this.numberField_!.getNumber());
        await user.updatePhoneNumber(authCred);
        $('#notifications').removeAttr('disabled');
        AddMessage(element, 'Phone number updated.', true);
      }
    } catch (e) {
      AddMessage(element, GetErrorMessage(e));
      this.numberField_!.setNumber(user.phoneNumber || '');
    }
  }

  private async getPhoneCredential(phoneNumber: string): Promise<firebase.default.auth.PhoneAuthCredential> {
    // Not present in emulator.
    const widgetId = await this.recaptchaVerifier_.render();
    grecaptcha?.reset(widgetId);

    const confResult = await
      firebase.auth().signInWithPhoneNumber(phoneNumber, this.recaptchaVerifier_);
    const code = prompt("Verification Code", '') || '';
    return firebase.auth.PhoneAuthProvider.credential(confResult.verificationId, code);
  }
};
