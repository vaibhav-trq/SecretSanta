import { auth } from 'firebase-admin';

export class UserProfile implements SecretSanta.IUserProfile {
  user: SecretSanta.IUserDetails;
  address: SecretSanta.IUserAddress;
  settings: SecretSanta.IUserSettings;
  favorites: SecretSanta.IUserFavorites;

  constructor(user: auth.UserRecord) {
    this.user = {
      displayName: user.displayName || '',
      email: user.email || '',
      number: user.phoneNumber,
      photoUrl: user.photoURL,
    };
    this.address = {
      street: '',
      street2: '',
      city: '',
      state: '',
      zip: '',
    };
    this.settings = {
      text_notifications: '',
    };
    this.favorites = {
      food: '',
      drink: '',
      savory_snack: '',
      sweet_snack: '',
      shirt_size: '',
      shoe_size: '',
      love: '',
      dont_want: '',
    };
  }
}
