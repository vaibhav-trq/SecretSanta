const { firebase, firebaseui } = window;
import { SwapContent } from './common.js'

class LoginManager {
  static ui: firebaseui.auth.AuthUI;
  uiConfig!: firebaseui.auth.Config;

  constructor() {
    if (!LoginManager.ui) {
      LoginManager.ui = new firebaseui.auth.AuthUI(firebase.auth());
    }
    this.uiConfig = {
      signInOptions: [
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          signInMethod: firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
        },
        firebase.auth.PhoneAuthProvider.PROVIDER_ID,
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
};

const ShowHomePage = async (user: firebase.default.User) => {
  SwapContent('home', user.toJSON());
  $('#logoutButton').on('click', () => {
    firebase.auth().signOut();
  });
};

export const HandleAuth = async (user: firebase.default.User | null) => {
  if (!user) {
    SwapContent('login');
    const loginManager = new LoginManager();
    loginManager.render();
  } else {
    await ShowHomePage(user);
  }
}

