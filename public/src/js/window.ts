export { };

declare global {
  interface Window {
    firebase: typeof import('firebase/app').default;
    firebaseui: typeof import('firebaseui');
  }
}
