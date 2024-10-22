import { analytics } from './segment';
import { configStore } from '@/src/background/commons/constants';
import { captureError } from '@/src/background/commons/sentry-log';
import { userService } from '@/src/background/services';
import localStorageService from '@/src/background/services/local-storage.service';
import type { UnknownType } from '@/src/interfaces';

export enum SegmentAnalyticsEvents {
  PLATFORM_USAGE_ANALYTICS = 'Platform usage - Chrome Extension',
  ACCOUNT_SETUP_COMPLETE = 'Account Setup Complete - Chrome Extension',
  EXTENSION_INSTALLED = 'App Installed - Chrome Extension',
  EXTENSION_UPDATED = 'App Updated - Chrome Extension',
  MANUAL_RELOAD_EXTENSION = 'Extension reloaded manually - Chrome Extension',
  MEETING_PAGE_VISITED = 'Meeting page visited - Chrome Extension',
  MANUAL_UPLOAD_CLICKED = 'Manual upload clicked - Chrome Extension',
  FRED_PRESENCE_CHECK = 'Fred presence check - Chrome Extension',
}

const updateIdentity = async () => {
  const { userId: initializedUserId } = analytics.getState('user');
  const userTraits = {
    user_id: '',
    email: '',
    name: '',
  }
  // eslint-disable-next-line prefer-const
  let { user_id: userId, email, name } = userTraits;
  if (!userId) {
    const error = new Error('Cannot initialize analytics due to user is not logged in');
    console.log(error);
    return;
  }

  // skip init if we already have the same user
  if (userId === initializedUserId) return;

  try {
    await analytics.init(userTraits);
    if (initializedUserId && userId !== initializedUserId) {
      console.log(`Analytics user changed from ${initializedUserId} to ${userId}`);
      analytics.reset();
      userId = initializedUserId;
    }
    await analytics.identify(userId, { email, name, id: userId });
    console.log('Analytics initialized for user ', userId);
  } catch (err) {
    captureError(err as Error);
    console.log('Unable to initialize analytics', err);
  }
};

export const analyticsTrackWithoutIdentity = async (
  event: SegmentAnalyticsEvents,
  properties: UnknownType,
): Promise<void> => {
  await analytics.init({});
  // @ts-ignore
  const uuId = (await localStorageService.get('userUuid')) as string;
  await analytics.identify(uuId, { id: uuId });
  await analytics.track(event, properties);
};

export const analyticsTrack = async (event: SegmentAnalyticsEvents, properties: UnknownType): Promise<void> => {
  const isLoggedIn = !!(await userService.getAccountInfo());
  if (!isLoggedIn) {
    await analyticsTrackWithoutIdentity(event, properties);
    return;
  }

  await updateIdentity();

  let chromeExtVersion = configStore.getConfig('DEFAULT_APP_VERSION');
  if (chrome.runtime && chrome.runtime.getManifest) {
    chromeExtVersion = chrome.runtime.getManifest().version;
  }

  await analytics.track(event, { ...properties, chromeExtVersion });
};
