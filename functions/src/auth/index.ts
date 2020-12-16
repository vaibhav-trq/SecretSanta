import * as firebase from 'firebase-functions';
import * as admin from 'firebase-admin';
import { UserProfile } from '../models/users';
import { DbRoot } from '../db/db';

export const OnUserCreated = async (user: admin.auth.UserRecord, context: firebase.EventContext) => {
  return await DbRoot.child('users').child(user.uid).child('profile').set(new UserProfile(user));
};

export const OnUserDeleted = async (user: admin.auth.UserRecord, context: firebase.EventContext) => {
  return await DbRoot.child('users').child(user.uid).remove();
};
