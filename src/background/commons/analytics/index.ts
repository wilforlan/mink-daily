import { analytics } from './segment';
import { configStore } from '@/src/background/commons/constants';
import { captureError } from '@/src/background/commons/sentry-log';
import { userService } from '@/src/background/services';
import localStorageService from '@/src/background/services/local-storage.service';
import type { UnknownType } from '@/src/interfaces';
import { isProduction } from '@/src/misc';

export enum SegmentAnalyticsEvents {
  PLATFORM_USAGE_ANALYTICS = 'Platform usage - Chrome Extension',
  ACCOUNT_SETUP_COMPLETE = 'Account Setup Complete - Chrome Extension',
  EXTENSION_INSTALLED = 'App Installed - Chrome Extension',
  EXTENSION_UPDATED = 'App Updated - Chrome Extension',
  USER_SIGNUP = 'User Signup - Chrome Extension',
  SUMMARIZATION_COMPLETE = 'Summarization Complete - Chrome Extension',
  SUMMARIZATION_FAILED = 'Summarization Failed - Chrome Extension',
  SUMMARIZATION_STARTED = 'Summarization Started - Chrome Extension',
  LLM_SUMMARIZATION_FAILED_WITH_RETRY = 'Summarization Failed With Retry - Chrome Extension',
  LLM_SUMMARIZATION_STARTED = 'LLM Summarization Started - Chrome Extension',
  LLM_SUMMARIZATION_FAILED = 'LLM Summarization Failed - Chrome Extension',
  USER_FETCHED_SUMMARY = 'User Fetched Summary - Chrome Extension',
  SETTINGS_UPDATED = 'Settings Updated - Chrome Extension',
  WEB_PAGE_SESSION_SAVED = 'Web Page Session Saved - Chrome Extension',
  DATA_RETENTION_POLICY_CLEANUP = 'Data Retention Policy Cleanup - Chrome Extension',
  USER_SENT_DIGEST_EMAIL = 'User Sent Digest Email - Chrome Extension',
}

const updateIdentity = async () => {
  const { email: initializedUserEmail } = analytics.getState('user');
  const { email: userEmail } = await userService.getAccountInfo();
  
  const userTraits = {
    email: userEmail,
  }
  // eslint-disable-next-line prefer-const
  let { email } = userTraits;
  
  if (!email) {
    const error = new Error('Cannot initialize analytics due to user is not logged in');
    console.log(error);
    return;
  }

  // skip init if we already have the same user
  if (email === initializedUserEmail) return;

  try {
    await analytics.init(userTraits);
    if (initializedUserEmail && email !== initializedUserEmail) {
      console.log(`Analytics user changed from ${initializedUserEmail} to ${email}`);
      analytics.reset();
      email = initializedUserEmail;
    }
    await analytics.identify(email, { email, name });
    console.log('Analytics initialized for user ', email);
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
  if (!isProduction) return console.log('Analytics is disabled in non-production environment', {
    event,
    properties,
  });
  
  const user = (await userService.getAccountInfo());
  
  const isLoggedIn = !!user;
  if (!isLoggedIn) {
    await analyticsTrackWithoutIdentity(event, properties);
    return;
  }

  await updateIdentity();

  let chromeExtVersion = configStore.getConfig('DEFAULT_APP_VERSION');
  if (chrome.runtime && chrome.runtime.getManifest) {
    chromeExtVersion = chrome.runtime.getManifest().version;
  }

  await analytics.track(event, { 
    ...properties,
    chromeExtVersion,
    email: isLoggedIn ? user.email : '',
  });
};
