const { firebase } = window;

export interface IUserFavorites {
  drink: string,
  food: string,
  [key: string]: string,
};

export interface IUserAddress {
  street: string,
  street2: string,
  city: string,
  state: string,
  zip: string,
  [key: string]: string,
};

export interface IUserSettings {
  text_notifications: string | null,
  [key: string]: string | null,
};

export interface IUserData {
  address: IUserAddress,
  favorites: IUserFavorites,
  settings: IUserSettings,
};

export const LoadUserData = async (): Promise<IUserData> => {
  const user = firebase.auth().currentUser!;
  const ref = firebase.database().ref(`users/${user.uid}`);
  const val = await ref.once('value');
  return val.val();
};
