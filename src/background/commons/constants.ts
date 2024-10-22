import { ConfigStore } from './classes';

export const configStore = new ConfigStore({
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  MAX_QUEUE_TIME_MS: 60 * 60 * 1000,
  APP_CODE: 'mink-daily-chrome',
  DEFAULT_APP_VERSION: '4.0.0',
  SENTRY_DSN_URL: 'https://16ca91ad987228bd48cbc9d2e5161c90@o207331.ingest.us.sentry.io/4507652828233728',
  WEBSTORE_URL:
    'https://chrome.google.com/webstore/detail/fireflies-meeting-recorde/meimoidfecamngeoanhnpdjjdcefoldn?hl=en',
  HELP_URL: 'https://usemink.com/security',
  TERMS_URL: 'https://usemink.com/terms-of-service.pdf',
  PRICING_URL: 'https://usemink.com/upgrade?pwl=chrome_extn_V2',
  MAX_LOGS_IN_STORAGE: 50000,
  MEDIA_STORAGE: {
    staging: 'https://media-storage.fireflies.dev',
    prod: 'https://media-storage.firefliesapp.com',
  },
  LOG_STORE_KEY: 'mink_log_store',
  UNINSTALL_URL: 'https://vfjfvkf3.paperform.co',
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
