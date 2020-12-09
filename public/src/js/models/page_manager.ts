import { PageTypes } from "./nav";

export interface IPageManagerInternal {
  /** Returns to the previous page. */
  back(): Promise<void>;

  /** Swaps to a different page. */
  swapPage(name: PageTypes): Promise<void>;
};

export interface IPageManager {
  /** Called when a user is logged out. */
  onLogout(): Promise<void>;

  /** Called when a user logs in. */
  onLogin(): Promise<void>;
};
