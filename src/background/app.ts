import { ServiceWorkerApp, ServiceWorkerModule } from './commons/classes';
import { configStore } from './commons/constants';
import { initializeSentry } from './commons/sentry-log';
import { showChromeNotification } from '@/src/background/utils';
import { SegmentAnalyticsEvents, analyticsTrack, analyticsTrackWithoutIdentity } from '@/src/background/commons/analytics';
import { queueService, userService } from './services';
import localStorageService from './services/local-storage.service';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import { YoutubeSummary, defaultApplicationState } from '@/src/misc';

export class BackgroundApp extends ServiceWorkerApp {

  constructor(modules: ServiceWorkerModule[]) {
    super('BackgroundApp');
    this.addModules(modules);
    console.debug('Modules added successfully');
  }


  onInstalled() {
    console.debug('App installed event received');
    const welcomeUrl = chrome.runtime?.getURL('tabs/welcome.html');
    chrome.runtime.setUninstallURL(configStore.getConfig('UNINSTALL_URL'));
    chrome.tabs.create({ url: welcomeUrl });

    // @ts-ignore
    localStorageService.get('last_installed_version').then(async (lastInstalledVersion) => {
      if (!lastInstalledVersion) {
        await analyticsTrackWithoutIdentity(SegmentAnalyticsEvents.EXTENSION_INSTALLED, {
          timestamp: new Date().toISOString(),
        });
        // @ts-ignore
        await localStorageService.put('first_installed_version', chrome.runtime.getManifest().version);
      }
      // @ts-ignore
      await localStorageService.put('last_installed_version', chrome.runtime.getManifest().version);
      console.info('App install analytics sent successfully');
    });

    // @ts-ignore
    localStorageService.put('userId', uuid());

    // Here we're duplicating the default setting state manually to avoid
    // then being undefined for some reason, ideally this should be shared in
    // the future
    localStorageService
        // @ts-ignore
      .put('settings', {
        options: {
          executeSummariesAfter: 24, // 24 hours
          deleteDataEvery: 3, // 3 days
          forwardMinkDigestToEmail: true, // true
          maxAllowedLinksPerDay: 200,
          shouldIgnoreSocialMediaPlatforms: true,
          startTrackingSessionAfter: 5, // 5 minutes
          ignoredWebsiteList: [],
        }
      })
      .then(() => {
        console.debug('Settings initialized');
      });
    
    queueService.createSummarizationJob();
    queueService.createDataRetentionPolicyCleanupJob();
  }

  async onUpdated() {
    console.debug('App updated event received');

    const user = await userService.getAccountInfo();
    const isLoggedIn = !!user;

    // @ts-ignore
    await localStorageService.put('last_installed_version', chrome.runtime.getManifest().version);

    // @ts-ignore
    const currentSettings: any = await localStorageService.get('settings');
    // Here we're duplicating the default setting state manually to avoid
    // then being undefined for some reason, ideally this should be shared in
    // the future
    localStorageService
        // @ts-ignore
      .put('settings', {
        options: {
          executeSummariesAfter: 24, // 24 hours
          deleteDataEvery: 3, // 3 days
          forwardMinkDigestToEmail: true, // true
          maxAllowedLinksPerDay: 200,
          shouldIgnoreSocialMediaPlatforms: true,
          startTrackingSessionAfter: 5, // 5 minutes
          ignoredWebsiteList: [],
          ...(currentSettings?.options ?? {}),
        },
      })
      .then(() => {
        console.debug('Settings initialized');
      });

    const analyticsParams = {
      email: 'NA',
      firstInstalledVersion: await localStorageService.get('first_installed_version'),
      lastInstalledVersion: await localStorageService.get('last_installed_version'),
    };
    
    if (isLoggedIn) {
      analyticsParams.email = user.email;
    }

    try {
      await analyticsTrack(SegmentAnalyticsEvents.EXTENSION_UPDATED, {
        ...analyticsParams,
        timestamp: new Date().toISOString(),
      });
      console.info('App update analytics sent successfully');
    } catch (error) {
      console.error(error as Error);
    }

    // @ts-ignore
    await localStorageService.delete('upcoming_version');
    queueService.createSummarizationJob();
    queueService.createDataRetentionPolicyCleanupJob();
  }

  async ensureUserStorage() {
    const localBytesUsed: number = await new Promise((resolve) => {
      chrome.storage.local.getBytesInUse(resolve);
    });
    const localBytesAvailable = chrome.storage.local.QUOTA_BYTES;

    if (localBytesUsed > localBytesAvailable * 0.8) {
      // This is potentially bad we'll need to flush the local storage or our app could
      // crash.
        console.warn('Local storage has reached max value some data may not be saved');
    }

    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;

    const BYTES_2GB = 2 * 1024 * 1024 * 1024;
    if (used > 0.8 * BYTES_2GB) {
      console.warn('Origin storage has reached max value some data may not be saved');
    }
  }

  async onInit() {
    console.debug('App init event received');
    initializeSentry();

    await this.ensureUserStorage();
    const info = await userService.getAccountInfo();
    const isLoggedIn = !!info;

    if (!isLoggedIn) {
      console.info('Starting up with empty user session');
    } else {
      /** set up global user parameters to use in the app **/
      console.info('Starting up with user session', { email: info.email });
    }

    /**
     * set up a global listener to allow for logging info from the offscreen document
     * add allow access to write log reports.
     */
    chrome.runtime.onMessage.addListener((message, sender) => {
      const serviceWorkerId = chrome.runtime.id;
      if (sender.id !== serviceWorkerId && sender.url!.indexOf('offscreen') >= 0) {
        return;
      }
    });

    /**
     * transfer messages from webpages to the internal messaging system
     * this allows us to use the same messaging system for both internal and external messages
     **/
    chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
      const id = uuid();

      const shouldForward = request.name && request.body;
      if (!shouldForward) {
        console.log(`[EXTERNAL MESSAGE] ${JSON.stringify(request)} ignored`);
        return;
      }

      request.externalMessageId = id;
      // @ts-ignore
      chrome.runtime.onMessage.dispatch(request, sender, sendResponse);
      return true;
    });

    chrome.runtime.onUpdateAvailable.addListener(async (details: chrome.runtime.UpdateAvailableDetails) => {
      const currentVersion = chrome.runtime?.getManifest().version;
      const newVersion = details?.version;
      if (currentVersion !== newVersion) {
        const { LatestVersionAvailable } = { LatestVersionAvailable: newVersion };
        showChromeNotification(LatestVersionAvailable);
        // @ts-ignore
        await localStorageService.put('upcoming_version', newVersion);
      }
    });
    queueService.createSummarizationJob();
    queueService.createDataRetentionPolicyCleanupJob();
  }
}
