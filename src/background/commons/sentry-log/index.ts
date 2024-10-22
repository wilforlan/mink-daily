import { configStore } from '@/src/background/commons/constants';
import { bytesToMb } from '@/src/background/utils';
import { type Event, type StackFrame, init, captureException, setContext, setTag } from '@sentry/react';
import { LocalStorageService } from '@/src/background/services/local-storage.service';
import { isProduction } from '@/src/misc';

class SentryCapturer {
  private email = '';

  private readonly localStorage = new LocalStorageService();

  private sentryArguments = () => ({
    dsn: configStore.getConfig('SENTRY_DSN_URL'),
    autoSessionTracking: true,
    integrations: [],
    release: chrome?.runtime?.getManifest?.()?.version,
    tracesSampleRate: 0,
    beforeSend(event: Event): Event {
      if (event.exception) {
        event.exception.values?.[0]?.stacktrace?.frames?.forEach((frame: StackFrame) => {
          /* eslint-disable-next-line no-param-reassign */
          frame.filename = frame.filename?.substring(frame.filename.lastIndexOf('/'));
        });
      }
      return event;
    },
  });

  private configureSentryEmail = (email: string): void => {
    if (email) setContext('UserEmail', { email });
  };

  private configureStorageUsage = (storageUsage: number): void => {
    setTag('storage_usage_in_mb', bytesToMb(storageUsage).toFixed(2));
  };

  private configureStorageQuota = (storageQuota: number): void => {
    setTag('storage_quota_in_mb', bytesToMb(storageQuota).toFixed(2));
  };

  onInit = async (): Promise<void> => {
    if (isProduction) {
        // @ts-ignore
      init(this.sentryArguments());
      // @ts-ignore
      const info: any = await this.localStorage.get<>('user');
      if (info?.email) {
        this.configureSentryEmail(info.email);
        this.email = info.email;
      }

      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        if (estimate.quota) {
          this.configureStorageQuota(estimate.quota);
        }
        if (estimate.usage) {
          this.configureStorageUsage(estimate.usage);
        }
      }
    }
  };

  private quickTestTable = new Map<number, number>();

  /* eslint-disable no-bitwise, no-plusplus */
  private cyrb53 = (str: string, seed = 1201): number => {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  };
  /* eslint-enable no-bitwise, no-plusplus */

  captureError = async (error: Error, message?: string | null, extra?: any): Promise<void> => {
    if (!this.email) await this.onInit();
    if (this.email && isProduction) {
      let combinedError: Error;
      if (message) {
        combinedError = new Error(`${message}: ${error.message}`);
        combinedError.stack = error.stack;
      } else {
        combinedError = error;
      }

      // we'll use the stack trace as a unique identifier for the error
      const stackTrace = combinedError.stack || error.message || '';
      const base64StackTrace = btoa(stackTrace);
      const hash = this.cyrb53(base64StackTrace);

      if (this.quickTestTable.has(hash) && (this.quickTestTable.get(hash) || 0) > Date.now()) {
        // we've already seen this error, don't report it again for now
        console.log(`skipping error ${message || error} with ${hash}`);
        return;
      }

      // we'll throttle similar errors to once per minute
      this.quickTestTable.set(hash, Date.now() + 1000 * 60);
      captureException(combinedError, extra);
    }
    console.log(message || error);
  };

  createError = async (error: string): Promise<void> => {
    if (!this.email) await this.onInit();
    const err = new Error(error);
    if (isProduction) this.captureError(err, error);
    return console.log(error);
  };
}

const { captureError, createError, onInit: initializeSentry } = new SentryCapturer();
export { captureError, createError, initializeSentry };
