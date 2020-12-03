const { firebase, firebaseui } = window;
import { SwapContent, AddMessage, GetErrorMessage } from './common.js'

interface intlTelInput {
  setNumber(number: string): void;
  getNumber(): string;
};
let profileNumberField: intlTelInput | null = null;

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
    const widgetId = await LoginManager.recaptchaVerifier.render();
    grecaptcha.reset(widgetId);

    const confResult = await
      firebase.auth().signInWithPhoneNumber(phoneNumber, LoginManager.recaptchaVerifier);
    const code = prompt("Verification Code", '') || '';
    return firebase.auth.PhoneAuthProvider.credential(confResult!.verificationId, code);
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
  let value = element.val()?.toString() || '';
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
  SwapContent('profile', user.toJSON());
  if (user.phoneNumber) {
    $('#notifications').removeAttr('disabled');
  }

  // @ts-expect-error: 2693
  profileNumberField = intlTelInput(document.querySelector('#profile [name="number"]'), {
    'utilsScript': '/libs/intl-tel-input/js/utils.js'
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

  $('#profile input:not([readonly])').on('keypress', async (e) => {
    if (e.key === "Enter") {
      await UpdateUser($(e.target));
    }
  });
  $('.profile-close').on('click', () => {
    ShowHomePage();
  });
}

const ShowHomePage = async () => {
  const user = firebase.auth().currentUser!;
  SwapContent('home', user.toJSON());

  $('#profileButton').on('click', () => {
    ShowProfile();
  });

  $('#logoutButton').on('click', () => {
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

