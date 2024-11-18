import { ConfigStore } from './classes';

export const configStore = new ConfigStore({
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  MAX_QUEUE_TIME_MS: 60 * 60 * 1000,
  APP_CODE: 'mink-daily-chrome',
  DEFAULT_APP_VERSION: '4.0.0',
  SENTRY_DSN_URL: 'https://3b7923a181d6d0f484acdcd740d9d5d9@o483787.ingest.us.sentry.io/4508275068829696',
  WEBSTORE_URL:
    'https://chromewebstore.google.com/detail/mink/gmegpffndocgmapjnokpihhfggclgjne',
  HELP_URL: 'https://usemink.com/security',
  TERMS_URL: 'https://usemink.com/terms-of-service.pdf',
  PRICING_URL: 'https://usemink.com/upgrade',
  MAX_LOGS_IN_STORAGE: 50000,
  LOG_STORE_KEY: 'mink_log_store',
  UNINSTALL_URL: 'https://forms.gle/qRHuwa283aiaizth6',
  MIN_MEETING_DURATION_SECONDS: {
    staging: 10,
    prod: 3 * 60,
  },
  MAX_MEETING_DURATION_SECONDS: {
    staging: 3 * 60,
    prod: 3 * 60 * 60,
  },
  MAX_RETENTION_IN_HOURS: {
    staging: 1, // after 3 minute
    prod: 4, // after 4 hours
  },
  TASK_WARNING_REPORT_THRESHOLD: {
    staging: 2,
    prod: 5,
  },
  ANALYTICS_KEY: {
    staging: 'QxMmnFtHxI7Tp1h86PxcZHdOwSfBcD1T',
    prod: 'QxMmnFtHxI7Tp1h86PxcZHdOwSfBcD1T',
  }
});
