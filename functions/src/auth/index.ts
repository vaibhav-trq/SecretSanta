import * as firebase from 'firebase-functions';
import * as admin from 'firebase-admin';
import { createAddress, Settings } from '../models/users';

export const OnUserCreated = async (user: admin.auth.UserRecord, context: firebase.EventContext) => {
  firebase.logger.info("Users created!", { structuredData: true });
  return admin.database().ref('/users/' + user.uid).set({
    displayName: user.displayName,
    address: createAddress(),
    settings: new Settings(user.emailVerified, user.phoneNumber, user.email),
  });
};

export const OnUserDeleted = (user: admin.auth.UserRecord, context: firebase.EventContext) => {
  firebase.logger.info("Users deleted!", { structuredData: true });
  return admin.database().ref('/users/' + user.uid).remove();
};
