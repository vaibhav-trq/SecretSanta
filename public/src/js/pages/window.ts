export { };

declare global {
  interface Window {
    firebaseui: typeof import('firebaseui');
    firebase: typeof import('firebase').default;
    Mustache: typeof import('mustache');
  }
}
