const { firebase, firebaseui } = window;

const CreateLogInUI = async () => {
  firebase.auth().useEmulator('http://localhost:9099/');
  await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  const ui = new firebaseui.auth.AuthUI(firebase.auth());
  ui.start('#firebaseui-auth-container', {
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
        document.getElementById('load')!.style.display = 'none';
      },

      signInSuccessWithAuthResult: (authResult: any, redirectUrl?: string) => {
        console.log('signInSuccessWithAuthResult', authResult, redirectUrl);
        return false;
      },

      // signInFailure callback must be provided to handle merge conflicts which
      // occur when an existing credential is linked to an anonymous user.
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
  });

  // Is there an email link sign-in?
  // if (ui.isPendingRedirect()) {
  //   ui.start('#firebaseui-auth-container', uiConfig);
  // }
};

export { CreateLogInUI };
