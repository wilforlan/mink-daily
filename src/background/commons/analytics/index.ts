import { analytics } from './segment';
import { configStore } from '@/src/background/commons/constants';
import { captureError } from '@/src/background/commons/sentry-log';
import { userService } from '@/src/background/services';
import localStorageService from '@/src/background/services/local-storage.service';
import type { UnknownType } from '@/src/interfaces';
import { isProduction } from '@/src/misc';

export enum SegmentAnalyticsEvents {
  PLATFORM_USAGE_ANALYTICS = 'Platform usage - Mink Chrome Extension',
  ACCOUNT_SETUP_COMPLETE = 'Account Setup Complete - Mink Chrome Extension',
  EXTENSION_INSTALLED = 'App Installed - Mink Chrome Extension',
  EXTENSION_UPDATED = 'App Updated - Mink Chrome Extension',
  USER_SIGNUP = 'User Signup - Mink Chrome Extension',
  USER_LOGIN = 'User Login - Mink Chrome Extension',
  SUMMARIZATION_COMPLETE = 'Summarization Complete - Mink Chrome Extension',
  SUMMARIZATION_FAILED = 'Summarization Failed - Mink Chrome Extension',
  SUMMARIZATION_STARTED = 'Summarization Started - Mink Chrome Extension',
  LLM_SUMMARIZATION_FAILED_WITH_RETRY = 'Summarization Failed With Retry - Mink Chrome Extension',
  LLM_SUMMARIZATION_STARTED = 'LLM Summarization Started - Mink Chrome Extension',
  LLM_SUMMARIZATION_FAILED = 'LLM Summarization Failed - Mink Chrome Extension',
  USER_FETCHED_SUMMARY = 'User Fetched Summary - Mink Chrome Extension',
  SETTINGS_UPDATED = 'Settings Updated - Mink Chrome Extension',
  WEB_PAGE_SESSION_SAVED = 'Web Page Session Saved - Mink Chrome Extension',
  DATA_RETENTION_POLICY_CLEANUP = 'Data Retention Policy Cleanup - Mink Chrome Extension',
  USER_SENT_DIGEST_EMAIL = 'User Sent Digest Email - Mink Chrome Extension',
  USER_SUMMARY_EXHAUSTION_NOTIFICATION = 'User Summary Exhaustion Notification - Mink Chrome Extension',
  
  USER_CLICKED_UPGRADE_TO_PRO = 'User Clicked Upgrade to Pro - Mink Chrome Extension',
  USER_UPGRADED_TO_PRO = 'User Upgraded to Pro - Mink Chrome Extension',

  USER_JOURNEY_LIMIT_REACHED = 'User Journey Limit Reached - Mink Chrome Extension',
  USER_JOURNEY_ENTRY_CREATED = 'User Journey Entry Created - Mink Chrome Extension',
  USER_JOURNEY_ENTRY_FAILED = 'User Journey Entry Failed - Mink Chrome Extension',
  USER_JOURNEY_ENTRY_SUCCESS = 'User Journey Entry Success - Mink Chrome Extension',
  USER_JOURNEY_DIRECTION_SET = 'User Journey Direction Set - Mink Chrome Extension',
  USER_JOURNEY_DIRECTION_SET_MANUALLY = 'User Journey Direction Set Manually - Mink Chrome Extension',
  USER_JOURNEY_PANEL_OPENED = 'User Journey Panel Opened - Mink Chrome Extension',
  USER_JOURNEY_PANEL_CLOSED = 'User Journey Panel Closed - Mink Chrome Extension',
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
    await analytics.identify(email, { email, name: email });
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
