/* global grecaptcha */
const { firebase, firebaseui } = window;

import { NavigationButtons, PageTypes } from "../models/nav.js";
import { IPageManagerInternal } from "../models/page_manager.js";
import { Page } from "../models/page.js";


export class LoginPage extends Page {
  protected readonly prefix_ = PageTypes.LOGIN;
  protected readonly buttons_ = new Set<NavigationButtons>();
  private readonly ui_: firebaseui.auth.AuthUI;
  private readonly uiConfig_: firebaseui.auth.Config;

  constructor(manager: IPageManagerInternal) {
    super(manager);
    this.ui_ = new firebaseui.auth.AuthUI(firebase.auth());
    this.uiConfig_ = {
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

  protected async onRender() {
    this.ui_.start('#firebaseui-auth-container', this.uiConfig_)
  }
};

