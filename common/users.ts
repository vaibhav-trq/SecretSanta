declare namespace common {
  export interface IUserFavorites {
    drink: string,
    food: string,
    savory_snack: string,
    sweet_snack: string,
    shirt_size: string,
    shoe_size: string,
    love: string,
    dont_want: string,
  }

  export interface IUserAddress {
    street: string,
    street2: string,
    city: string,
    state: string,
    zip: string,
  }

  export interface IUserSettings {
    text_notifications: string,
  }

  export interface IUserDetails {
    displayName: string,
    email: string,
    number?: string,
    photoUrl?: string,
  }

  export interface IUserProfile {
    user: IUserDetails
    address: IUserAddress,
    favorites: IUserFavorites,
    settings: IUserSettings,
  }

  export interface IUserRsvp {
    attending: boolean,
    host: boolean,
  }

  export interface IUser {
    /** Users's profile. */
    profile: IUserProfile,

    /** All events the user has RSVP'd to. */
    events: { [eid: string]: IUserRsvp },

    /** All chat rooms a user is a part of. */
    chats: { [rid: string]: boolean },
  }
}
