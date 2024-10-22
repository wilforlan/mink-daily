/**
 * Represents a Service Worker module.
 */
export class ServiceWorkerModule {
  /**
   * Handles the initialization event of the Service Worker module.
   * @returns {Promise<void> | void} A promise that resolves when the initialization is complete, or void.
   */
  onInit(): Promise<void> | void {}

  /**
   * Handles the suspension event of the Service Worker module.
   * @returns {Promise<void> | void} A promise that resolves when the suspension is complete, or void.
   */
  onSuspend(): Promise<void> | void {}
}
