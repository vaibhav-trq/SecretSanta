const { firebase } = window;

import { DbRoot } from "./models/db.js";
import { PageTypes } from "./models/nav.js";
import { PageManager } from "./page_manager.js";

document.addEventListener('DOMContentLoaded', async () => {
  // Assure that authorization is persistent for sessions, not a single tab.
  await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

  const pages = [PageTypes.LOGIN, PageTypes.INVITATION, PageTypes.ERROR_EVENT_404, PageTypes.ERROR_EVENT_ALREADY_JOINED];
  const manager = new PageManager(pages, PageTypes.INVITATION);
  const path = window.location.pathname.replace(/\/$/, '');
  const eventQueryId = path.substr(path.lastIndexOf('/') + 1);

  const eventQuery = DbRoot.child('events').child(eventQueryId).child('metadata');
  const [eventId, event] = await eventQuery.once();

  if (eventId) {
    // Main entry point is based on firebase auth.
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        // Some user is logged in.
        await manager.onLogin({ event, eventId });
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
