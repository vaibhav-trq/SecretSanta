const { firebase } = window;

import { SecretSantaEvent } from "./models/events.js";
import { PageTypes } from "./models/nav.js";
import { PageManager } from "./page_manager.js";

document.addEventListener('DOMContentLoaded', async () => {
  // Assure that authorization is persistent for sessions, not a single tab.
  await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

  const manager = new PageManager([PageTypes.INVITATION], PageTypes.INVITATION);
  const path = window.location.pathname.replace(/\/$/, '');
  const eventId = path.substr(path.lastIndexOf('/') + 1);

  const eventRef = firebase.database().ref('/events');
  const eventData = await eventRef.child(eventId).once('value');

  if (eventData.val()) {
    const event = new SecretSantaEvent(eventData.key!, eventData.val());
    await manager.swapPage(PageTypes.INVITATION, event);
  } else {
    // Redirect to home site.
    window.location.href = "/";
  }
});

$(window).on('load', () => {
  less.watch();
});
