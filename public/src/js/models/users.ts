const { firebase } = window;

import { DbRoot } from "./db.js";

export const LoadUserData = async () => {
  const user = firebase.auth().currentUser!;
  const [, profile] = await DbRoot.child('users').child(user.uid).child('profile').once();
  return profile;
};
