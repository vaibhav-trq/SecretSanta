const { firebase } = window;

import { DbRoot } from "./db.js";

export const LoadUserData = async (uid?: string) => {
  const user = firebase.auth().currentUser!;
  const [, profile] = await DbRoot.child('users').child(uid || user.uid).child('profile').once();
  return profile;
};
