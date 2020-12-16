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
  const eventId = path.substr(path.lastIndexOf('/') + 1);

  const eventQuery = DbRoot.child('events').child(eventId).child('metadata');
  const [, event] = await eventQuery.once();

  if (event) {
    firebase.auth().onAuthStateChanged(async user => {
      await manager.swapPage(PageTypes.INVITATION, {
        eventId,
        event,
      });
    });
  } else {
    await manager.swapPage(PageTypes.ERROR_EVENT_404);
  }
});

$(window).on('load', () => {
  less.watch();
});
