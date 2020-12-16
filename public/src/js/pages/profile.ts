const { firebase } = window;

import { Page } from "../models/page.js";
import { LoadUserData } from '../models/users.js';
import { NavigationButtons, PageTypes } from "../models/nav.js";
import { AddMessage, GetErrorMessage } from "../common.js";
import { IPageManagerInternal } from "../models/page_manager.js";
import { intlTelInput } from "../models/intlTelInput.js";
import { DbRoot } from "../models/db.js";

const GetOriginalValue = (attr: string): string => {
  const user = firebase.auth().currentUser!;

  if (attr === 'displayName') {
    return user.displayName || '';
  } else if (attr === 'number') {
    return user.phoneNumber || '';
  }
  return '';
};

const isAddressAttribute = (attr: string): attr is keyof SecretSanta.IUserAddress => {
  const valid = new Set<keyof SecretSanta.IUserAddress>(['street', 'street2', 'city', 'state', 'zip']);
  // @ts-ignore
  return valid.has(attr);
}
const isFavoriteAttribute = (attr: string): attr is keyof SecretSanta.IUserFavorites => {
  const valid = new Set<keyof SecretSanta.IUserFavorites>(['dont_want', 'drink', 'food', 'love', 'savory_snack', 'shirt_size', 'shoe_size', 'sweet_snack']);
  // @ts-ignore
  return valid.has(attr);
}

export class ProfilePage extends Page {
  protected readonly prefix_ = PageTypes.PROFILE;
  protected readonly buttons_ = new Set([NavigationButtons.HOME, NavigationButtons.LOGOUT]);

  private numberField_: intlTelInput | undefined;
  private readonly recaptchaVerifier_: firebase.default.auth.RecaptchaVerifier;

  constructor(manager: IPageManagerInternal, recaptchaVerifier: firebase.default.auth.RecaptchaVerifier) {
    super(manager);
    this.recaptchaVerifier_ = recaptchaVerifier;
  }

  protected async pageData(): Promise<SecretSanta.IUserProfile> {
    return await LoadUserData();
  }

  protected async onRender(userData: SecretSanta.IUserProfile) {
    const user = firebase.auth().currentUser!;

    // Update the profile.
    if (user.phoneNumber) {
      $('#notifications').removeAttr('disabled');
      if (userData.settings.text_notifications) {
        $('#notifications').prop("checked", true);
      }
    }

    // @ts-expect-error: 2693
    this.numberField_ = intlTelInput(document.querySelector(`#${this.prefix_} [name="number"]`), {
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
        await this.updateProfileData($(e.target));
      }
    });
    $('#favorites-form input:not([readonly])').on('keypress', async (e) => {
      if (e.key === "Enter") {
        await this.updateProfileData($(e.target));
      }
    });

    $('.profile-close').on('click', async () => {
      await this.manager_.back();
    });
  }


  private async updateTextNotification(element: JQuery<HTMLElement>) {
    const user = firebase.auth().currentUser!;
    const updateQuery = DbRoot.child('users').child(user.uid).child('profile').child('settings').child('text_notifications');
    const checked = element.prop('checked');
    try {
      if (checked) {
        if (!user.phoneNumber) {
          return AddMessage(element, 'No phone number on record.');
        }
        await updateQuery.set(user.phoneNumber);
        AddMessage(element, 'Enabled text messages.', true);
      } else {
        await updateQuery.set('');
        AddMessage(element, 'Disabled text messages.', true);
      }
    } catch (e) {
      AddMessage(element, GetErrorMessage(e));
      element.prop('checked', !checked);
    }
  };

  private async updateProfileData(element: JQuery<HTMLElement>) {
    const user = firebase.auth().currentUser!;

    const attr = element.attr('name')!;
    const value = element.val()?.toString() || '';
    if (!(isFavoriteAttribute(attr) || isAddressAttribute(attr))) {
      return;
    }

    try {
      if (isAddressAttribute(attr)) {
        await DbRoot.child('users').child(user.uid).child('profile').child('address').child(attr).set(value);
      } else {
        await DbRoot.child('users').child(user.uid).child('profile').child('favorites').child(attr).set(value);
      }
      AddMessage(element, 'Updated!', true);
    } catch (e) {
      AddMessage(element, GetErrorMessage(e));
      const orig = await LoadUserData();
      element.val(isAddressAttribute(attr) ? orig.address[attr] : orig.favorites[attr])
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
