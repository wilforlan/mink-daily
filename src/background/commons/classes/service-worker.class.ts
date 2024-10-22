import { ServiceWorkerModule } from './service-worker-module.class';

/**
 * Represents a service worker application.
 */
export class ServiceWorkerApp {
  private modules: ServiceWorkerModule[] = [];

  constructor(private readonly name: string) {}

  /**
   * Startup the application and all its modules.
   */
  public async init() {
    //NOTE: need to reorganize this based on app requirements
    this.initialiseListeners();
    await this.onInit();
    for (const module of this.modules) {
      await module.onInit();
    }
  }

  /**
   * Initializes event listeners for various runtime events.
   */
  private initialiseListeners() {
    chrome.runtime.onInstalled.addListener(async (details) => {
      switch (details.reason) {
        case chrome.runtime.OnInstalledReason.CHROME_UPDATE:
          await this.onBrowserUpdated();
          break;
        case chrome.runtime.OnInstalledReason.UPDATE:
          await this.onUpdated();
          break;
        case chrome.runtime.OnInstalledReason.INSTALL:
          await this.onInstalled();
          break;
        default:
          // TODO: we only need this in dev
          console.warn(`Ignoring ${details.reason}`);
      }
    });

    addEventListener('beforeunload', async () => {
      for (const module of this.modules) {
        await module.onSuspend();
      }
      await this.onSuspended();
    });
  }

  /**
   * Adds a module to the Test class.
   * @param {ServiceWorkerModule} module - The module to add.
   */
  protected addModule(module: ServiceWorkerModule) {
    this.modules.push(module);
  }

  /**
   * Adds multiple modules to the Test class.
   * @param {ServiceWorkerModule[]} modules - The modules to add.
   */
  protected addModules(modules: ServiceWorkerModule[]) {
    this.modules = [...this.modules, ...modules];
  }

  /**
   * Handles the event when the browser is updated.
   * @param {chrome.runtime.InstalledDetails} details - The event details.
   * @returns {Promise<void> | void} A promise or void.
   */
  onBrowserUpdated(): Promise<void> | void {}

  /**
   * Handles the event when the extension is installed.
   * @param {chrome.runtime.InstalledDetails} details - The event details.
   * @returns {Promise<void> | void} A promise or void.
   */
  onInstalled(): Promise<void> | void {}

  /**
   * Handles the event when the extension is updated.
   * @param {chrome.runtime.InstalledDetails} details - The event details.
   * @returns {Promise<void> | void} A promise or void.
   */
  onUpdated(): Promise<void> | void {}

  /**
   * Handles the event when the extension is suspended.
   */
  onSuspended() {}

  /**
   * Handles the event that occurs after the class has been initialized.
   * @returns {void | Promise<void>} Void or a promise.
   */
  onInit(): void | Promise<void> {}
}
