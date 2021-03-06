/** Enum for buttons which map you to different pages. */
export enum NavigationButtons {
  HOME = 'home',
  PROFILE = 'profile',
  LOGOUT = 'logout',
};

/** Templates for which pages exist. */
export enum PageTypes {
  LOGIN = 'login',
  HOME = 'home',
  PROFILE = 'profile',
  MATCH_PROFILE = 'match-profile',
  MATCH = 'match',
  EVENT_DETAILS = 'event-details',
  INVITATION = 'invitation',
  ERROR_EVENT_404 = 'error-event-404',
  ERROR_EVENT_ALREADY_JOINED = 'error-event-already-joined'
};

export const ButtonToPage = new Map([
  [NavigationButtons.HOME, PageTypes.HOME],
  [NavigationButtons.PROFILE, PageTypes.PROFILE],
])
