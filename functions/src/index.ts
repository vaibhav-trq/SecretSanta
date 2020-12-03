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

const createSettings = (): ISettings => {
  return {
    text_notifications: null,
  };
}

exports.addToDB = functions.auth.user().onCreate(async (user, context) => {
  return admin.database().ref('/users/' + user.uid).set({
    address: createAddress(),
    settings: createSettings(),
  });
});

exports.removeFromDB = functions.auth.user().onDelete((user, context) => {
  functions.logger.info("Users deleted!", { structuredData: true });
  return admin.database().ref('/users/' + user.uid).remove();
});
