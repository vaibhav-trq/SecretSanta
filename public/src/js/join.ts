const { firebase } = window;

import { DbRoot } from "./models/db.js";
import { PageTypes } from "./models/nav.js";
import { PageManager } from "./page_manager.js";

document.addEventListener('DOMContentLoaded', async () => {
  // Assure that authorization is persistent for sessions, not a single tab.
  await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

  const manager = new PageManager([PageTypes.INVITATION], PageTypes.INVITATION);
  const path = window.location.pathname.replace(/\/$/, '');
  const eventQueryId = path.substr(path.lastIndexOf('/') + 1);

  const eventQuery = DbRoot.child('events').child(eventQueryId).child('metadata');
  const [eventId, event] = await eventQuery.once();

  if (event) {
    firebase.auth().onAuthStateChanged(async user => {
      await manager.swapPage(PageTypes.INVITATION, {
        eventId,
        event,
      });
    });
  } else {
    // Redirect to home site.
    window.location.href = "/";
  }
});

$(window).on('load', () => {
  less.watch();
});
