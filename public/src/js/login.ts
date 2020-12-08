/* global grecaptcha */
const { firebase, firebaseui } = window;
import { SwapContent, AddMessage, GetErrorMessage } from './common.js'
import { LoadUserData, UpdateAddressData, UpdateTextNotification } from './database.js';
import { EventManager } from './event.js';

interface intlTelInput {
  setNumber(number: string): void;
  getNumber(): string;
};
let profileNumberField: intlTelInput | null = null;
let eventManager: EventManager | null = null;

class LoginManager {
  static ui: firebaseui.auth.AuthUI;
  static recaptchaVerifier: firebase.default.auth.RecaptchaVerifier;

  uiConfig!: firebaseui.auth.Config;

  constructor() {
    if (!LoginManager.ui) {
      LoginManager.ui = new firebaseui.auth.AuthUI(firebase.auth());
      LoginManager.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
      });
    }

    this.uiConfig = {
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      ],
      signInFlow: 'popup',
      popupMode: true,
      callbacks: {
        uiShown: () => {
          // The widget is rendered.
          // Hide the loader.
          // document.getElementById('load')!.style.display = 'none';
        },

        signInSuccessWithAuthResult: (authResult: any, redirectUrl?: string) => {
          console.log('signInSuccessWithAuthResult', authResult, redirectUrl);
          return false;
        },

        // signInFailure callback must be provided to handle merge conflicts which
        // occur when an existing credential is linked to an anonymous user.
        // @ts-expect-error: TS2322: signInFailure expects Promise<void> return, however to handle merges, the correct credentials must be returned.
        signInFailure: async (error: firebaseui.auth.AuthUIError) => {
          // For merge conflicts, the error.code will be
          // 'firebaseui/anonymous-upgrade-merge-conflict'.
          console.error("Sign in failed:", error);
          if (error.code !== 'firebaseui/anonymous-upgrade-merge-conflict') {
            return Promise.resolve();
          }
          // The credential the user tried to sign in with.
          const cred = error.credential;
          // Copy data from anonymous user to permanent user and delete anonymous
          // user.
          // ...
          // Finish sign-in after data is copied.
          return firebase.auth().signInWithCredential(cred);
        },
      },
    };
  }

  public render(): void {
    LoginManager.ui.start('#firebaseui-auth-container', this.uiConfig);
  };

  public async getPhoneCredential(phoneNumber: string): Promise<firebase.default.auth.PhoneAuthCredential> {
    // Not present in emulator.
    const widgetId = await LoginManager.recaptchaVerifier.render();
    grecaptcha?.reset(widgetId);

    const confResult = await
      firebase.auth().signInWithPhoneNumber(phoneNumber, LoginManager.recaptchaVerifier);
    const code = prompt("Verification Code", '') || '';
    return firebase.auth.PhoneAuthProvider.credential(confResult.verificationId, code);
  }
};

const GetOriginalValue = (attr: string, user: firebase.default.User): string => {
  if (attr === 'displayName') {
    return user.displayName || '';
  } else if (attr === 'number') {
    return user.phoneNumber || '';
  }
  return '';
};

const UpdateUserNumber = async (element: JQuery<HTMLElement>, user: firebase.default.User) => {
  const number = profileNumberField!.getNumber();
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
      const loginManager = new LoginManager();
      const authCred = await loginManager.getPhoneCredential(profileNumberField!.getNumber());
      await user.updatePhoneNumber(authCred);
      $('#notifications').removeAttr('disabled');
      AddMessage(element, 'Phone number updated.', true);
    }
  } catch (e) {
    console.log(e);
    AddMessage(element, GetErrorMessage(e));
    profileNumberField!.setNumber(user.phoneNumber || '');
  }
}

const UpdateUser = async (element: JQuery<HTMLElement>) => {
  const user = firebase.auth().currentUser!;
  const attr = element.attr('name')!;
  const value = element.val()?.toString() || '';
  const orig = GetOriginalValue(attr, user);
  if (orig === value) {
    return;
  }
  try {
    if (attr === 'displayName') {
      await user.updateProfile({ [attr]: value });
      AddMessage(element, 'Name updated.', true);
    } else if (attr === 'number') {
      await UpdateUserNumber(element, user);
    }
  } catch (e) {
    AddMessage(element, GetErrorMessage(e));
    element.val(orig);
  }
};

const ShowProfile = async () => {
  const user = firebase.auth().currentUser!;
  const userData = await LoadUserData();
  SwapContent('profile', { user: user.toJSON(), address: userData.address, settings: userData.settings });
  if (user.phoneNumber) {
    $('#notifications').removeAttr('disabled');
    if (userData.settings?.text_notifications) {
      $('#notifications').prop("checked", true);
    }
  }

  // @ts-expect-error: 2693
  profileNumberField = intlTelInput(document.querySelector('#profile [name="number"]'), {
    'utilsScript': '/libs/intl-tel-input/js/utils.js',
  });
  profileNumberField?.setNumber(user.phoneNumber || '');

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

  $('#notifications').on('change', async (e) => {
    await UpdateTextNotification($(e.target));
  });
  $('#profile-form input:not([readonly])').on('keypress', async (e) => {
    if (e.key === "Enter") {
      await UpdateUser($(e.target));
    }
  });
  $('#address-form input:not([readonly])').on('keypress', async (e) => {
    if (e.key === "Enter") {
      await UpdateAddressData($(e.target));
    }
  });

  $('.profile-close').on('click', async () => {
    await ShowHomePage();
  });
}

const ShowMatchProfile = async () => {
  const matchDiv = "#match-profile";

  const user = firebase.auth().currentUser!;
  const userData = await LoadUserData();
  SwapContent('match-profile', { user: user.toJSON(), address: userData.address, settings: userData.settings });
  if (user.phoneNumber) {
    $('#notifications').removeAttr('disabled');
    if (userData.settings?.text_notifications) {
      $('#notifications').prop("checked", true);
    }
  }

  // @ts-expect-error: 2693
  profileNumberField = intlTelInput(document.querySelector(`${matchDiv} [name="number"]`), {
    'utilsScript': '/libs/intl-tel-input/js/utils.js',
  });
  profileNumberField?.setNumber(user.phoneNumber || '');

  if (user.email) {
    const emailBadge = $(`${matchDiv} [name="email"]`).parent().find('.badge');
    if (user.emailVerified) {
      emailBadge.addClass('badge-success');
      emailBadge.html('Verified');
    } else {
      emailBadge.addClass('badge-danger');
      emailBadge.html('Unverified');
    }
  }

  $('#notifications').on('change', async (e) => {
    await UpdateTextNotification($(e.target));
  });
  $(`${matchDiv}-form input:not([readonly])`).on('keypress', async (e) => {
    if (e.key === "Enter") {
      await UpdateUser($(e.target));
    }
  });
  $('#match-address-form input:not([readonly])').on('keypress', async (e) => {
    if (e.key === "Enter") {
      await UpdateAddressData($(e.target));
    }
  });

  $('.profile-close').on('click', async () => {
    console.log('Getting this to work?');
    await ShowHomePage();
  });
}

const ShowMatch = async () => {
  const user = firebase.auth().currentUser!;
  const userData = await LoadUserData();
  SwapContent('match', { user: user.toJSON(), address: userData.address, settings: userData.settings });

  $('#santaChatButton').on('click', async () => {
    console.log("santa chat button pressed!")
    await ShowHomePage();
  });

  $('#gifteeChatButton').on('click', async () => {
    console.log("giftee chat button pressed!")
    await ShowHomePage();
  });

  $('#drawNamesButton').on('click', async () => {
    console.log("draw names button pressed!")
    await ShowHomePage();
  });

  $('#matchProfileButton').on('click', async () => {
    await ShowMatchProfile();
  });

  $('#homeButton').on('click', async () => {
    await ShowHomePage();
  });

  $('#profileButton').on('click', async () => {
    await ShowProfile();
  });

  $('#logoutButton').on('click', () => {
    return firebase.auth().signOut();
  });

}

const ShowHomePage = async () => {
  const user = firebase.auth().currentUser!;
  SwapContent('home', user.toJSON());
  eventManager = new EventManager($('#events'));

  $('#eventCard').on('click', async () => {
    console.log("got the right id")
    await ShowMatch();
  })

  $('#profileButton').on('click', async () => {
    eventManager?.terminate();
    await ShowProfile();
  });

  $('#hostEventButton').on('click', async () => {
    await eventManager?.createHostedEvent();
  });

  $('#logoutButton').on('click', () => {
    eventManager?.terminate();
    return firebase.auth().signOut();
  });
};

export const HandleAuth = async (user: firebase.default.User | null) => {
  if (!user) {
    SwapContent('login');
    const loginManager = new LoginManager();
    loginManager.render();
  } else {
    await ShowHomePage();
  }
}

