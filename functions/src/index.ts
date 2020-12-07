import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

interface IAddress {
  street: string,
  street2: string,
  city: string,
  state: string,
  zip: string,
};
interface ISettings {
  phone: string | null,
  email: string | null,
  text_notifications: string | null,
};

const createAddress = (): IAddress => {
  return {
    street: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
  }
}

class Settings implements ISettings {
  phone: string | null;
  email: string | null;
  text_notifications: string | null;

  constructor(verified: boolean, phone?: string, email?: string) {
    this.phone = phone || null;
    this.email = verified ? email! : null;
    this.text_notifications = null;
  }
}

exports.createUser = functions.auth.user().onCreate(async (user, context) => {
  return admin.database().ref('/users/' + user.uid).set({
    displayName: user.displayName,
    address: createAddress(),
    settings: new Settings(user.emailVerified, user.phoneNumber, user.email),
  });
});

exports.removeUser = functions.auth.user().onDelete((user, context) => {
  functions.logger.info("Users deleted!", { structuredData: true });
  return admin.database().ref('/users/' + user.uid).remove();
});
