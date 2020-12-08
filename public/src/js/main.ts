const { firebase } = window;
import { PageManager } from './page_manager.js';


document.addEventListener('DOMContentLoaded', async () => {
  // Assure that authorization is persistent for sessions, not a single tab.
  await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

  // Create page manager.
  const manager = new PageManager();

  // Main entry point is based on firebase auth.
  firebase.auth().onAuthStateChanged(async user => {
    if (user) {
      // Some user is logged in.
      await manager.onLogin();
    } else {
      // No user is logged in.
      await manager.onLogout();
    }
  });
});

$(window).on('load', () => {
  less.watch();
});
