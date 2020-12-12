import { PageTypes } from "./nav";

export interface IPageManagerInternal {
  /** Returns to the previous page. */
  back(): Promise<void>;

  /**
   * Swaps to the next page.
   * 
   * @param name Page Name.
   * @param context Context required to create page.
   */
  swapPage(name: PageTypes, context: any | undefined): Promise<void>;
  swapPage(name: PageTypes): Promise<void>;
};

export interface IPageManager {
  /** Called when a user is logged out. */
  onLogout(): Promise<void>;

  /** Called when a user logs in. */
  onLogin(): Promise<void>;
};
