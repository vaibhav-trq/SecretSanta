import { ButtonToPage, NavigationButtons, PageTypes } from "./nav.js";
import { RenderTemplate } from "../common.js";
import { IPageManagerInternal } from "./page_manager.js";
import { Logger } from "./logger.js";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IRenderData { };

export abstract class Page extends Logger {
  /** DOM used for rendering. */
  private static readonly content_ = $('#content');
  /** Template prefix for page. */
  protected abstract readonly prefix_: PageTypes;
  /** Set of buttons visible on the page. Any buttons not in the set are not visible on that page. */
  protected abstract readonly buttons_: Set<NavigationButtons>;
  /** Manager which owns this page. */
  protected readonly manager_: IPageManagerInternal;

  constructor(manager: IPageManagerInternal) {
    super();
    this.manager_ = manager;
  }

  /** Render the page. */
  async render(context: any | undefined) {
    await this.setContext(context);
    const data = await this.pageData();
    // Render the page content.
    RenderTemplate(`${this.prefix_}-content`, Page.content_, data);

    // Render the appropriate nav buttons.s
    $('#nav-buttons button').addClass('d-none');
    this.buttons_.forEach(btn => {
      if (ButtonToPage.get(btn) !== this.prefix_) {
        $(`#${btn}-button`).removeClass('d-none');
      }
    });
    await this.onRender(data);
  }

  /** The result is used for rendering the template. */
  protected async pageData(): Promise<IRenderData> {
    return {};
  }

  /** Called to clean up any handlers whenever existing a page. */
  protected async onRender(renderData: IRenderData): Promise<void> { return; }

  /** Called prior to swapping to a different page. */
  onExit(): void { return; }


  /** Called prior to swapping to a different page. */
  protected async setContext(context: any): Promise<void> { return; }
};
