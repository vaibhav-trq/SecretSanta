const { firebase } = window;

import { SecretSantaEvent } from "./models/events.js";
import { PageTypes } from "./models/nav.js";
import { PageManager } from "./page_manager.js";

document.addEventListener('DOMContentLoaded', async () => {
  // Assure that authorization is persistent for sessions, not a single tab.
  await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

  const pages = [PageTypes.LOGIN, PageTypes.INVITATION, PageTypes.ERROR_EVENT_404, PageTypes.ERROR_EVENT_ALREADY_JOINED];
  const manager = new PageManager(pages, PageTypes.INVITATION);
  const path = window.location.pathname.replace(/\/$/, '');
  const eventId = path.substr(path.lastIndexOf('/') + 1);

  const eventRef = firebase.database().ref('/events');
  const eventData = await eventRef.child(eventId).once('value');

  if (eventData.val()) {
    const event = new SecretSantaEvent(eventData.key!, eventData.val());
    // Main entry point is based on firebase auth.
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        // Some user is logged in.
        await manager.onLogin(event);
      } else {
        // No user is logged in.
        await manager.onLogout();
      }
    });
  } else {
    await manager.swapPage(PageTypes.ERROR_EVENT_404);
  }
});

$(window).on('load', () => {
  less.watch();
});
