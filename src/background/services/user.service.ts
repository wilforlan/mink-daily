import { configStore } from '@/src/background/commons/constants';
import type {
  LocalStorageMetadata,
} from '@/src/background/commons/types';

import {
  showChromeNotification,
} from '@/src/background/utils';

import type { LocalStorageService } from './local-storage.service';
import { captureError } from '@/src/background/commons/sentry-log';
import { analyticsTrack, SegmentAnalyticsEvents } from '@/src/background/commons/analytics';
import type { ILoginUserRes } from '@/src/interfaces';
import OpenAIService from './openai.service';
import { queueService } from '.';
import type { DatabaseService } from './database.service';
import { scope, scope as sentryScope } from '@/src/lib/sentry';

scope.setTag('service', 'user.service.ts');

const validateEmail = (email: string) => {
  // complex regex for email validation
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

export class UserService {
  constructor(
    private readonly localStorageService: LocalStorageService<LocalStorageMetadata>,
    private readonly databaseService: DatabaseService
  ) {}

  async getAccountInfo() {
    const user = await this.localStorageService.get('user');
    return user;
  }

  async setAccountInfo(accountInfo: ILoginUserRes) {
    await this.localStorageService.put('planTier', 'free');
    await this.localStorageService.put('user', {
      planTier: "free",
      stripeCustomerId: "",
      stripeSubscriptionId: "",
      stripePriceId: "",
      stripeCurrentPeriodEnd: "",
      ...accountInfo,
    });

    if (accountInfo.isNewUser) {
      await analyticsTrack(SegmentAnalyticsEvents.USER_SIGNUP, {
        email: accountInfo.email,
        username: accountInfo.username,
        planTier: accountInfo.planTier,
        stripeCustomerId: accountInfo.stripeCustomerId,
        stripeSubscriptionId: accountInfo.stripeSubscriptionId,
        stripePriceId: accountInfo.stripePriceId,
        stripeCurrentPeriodEnd: accountInfo.stripeCurrentPeriodEnd,
      });
    } else {
      await analyticsTrack(SegmentAnalyticsEvents.USER_LOGIN, {
        email: accountInfo.email,
        username: accountInfo.username,
        planTier: accountInfo.planTier,
      });
    }

    const settings = await this.localStorageService.get('settings');
    
    if (!settings) {
      await this.localStorageService.put('settings', {
        options: {
          executeSummariesAfter: 24, // 24 hours
          deleteDataEvery: 7, // 3 days
          forwardMinkDigestToEmail: true, // true
          maxAllowedLinksPerDay: 50,
          shouldIgnoreSocialMediaPlatforms: true,
          startTrackingSessionAfter: 3, // 3 minutes
          ignoredWebsiteList: [],
        },
      });
    }

    await queueService.createSummarizationJob({ source: 'signup' });
    await queueService.createRunPeriodicEmailJob();
    sentryScope.setUser(accountInfo);
    return accountInfo;
  }

  async logoutUser(silent?: boolean) {
    await this.localStorageService.delete('user');
    // purge all data
    await this.databaseService.db.delete();
    if (!silent) {
      showChromeNotification({
        title: 'Logged out',
        message: 'You have been logged out',
      });
    }
  }

  async updateSettings(settings: any) {
    // options: {
    //   executeSummariesAfter: 24, // 24 hours
    //   deleteDataEvery: 3, // 3 days
    //   forwardMinkDigestToEmail: true, // true
    //   maxAllowedLinksPerDay: 100,
    //   shouldIgnoreSocialMediaPlatforms: true,
    //   startTrackingSessionAfter: 3, // 3 minutes
    // }

    const currentSettings = await this.localStorageService.get('settings');
    await this.localStorageService.update('settings', {
      options: settings,
    });

    const shouldAddJob = parseInt(settings.executeSummariesAfter) !== parseInt(currentSettings.options.executeSummariesAfter);
    if (shouldAddJob) {
      console.log('Creating summarization job because settings changed for executeSummariesAfter', {
        current: currentSettings.options.executeSummariesAfter,
        new: settings.executeSummariesAfter,
      });
      await queueService.createSummarizationJob({ source: 'settings-change', updatedSettings:settings });
    }
    return settings;
  }

  async getSettings() {
    const settings = await this.localStorageService.get('settings');
    return settings;
  }
}
