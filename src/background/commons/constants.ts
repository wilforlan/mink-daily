import { ConfigStore } from './classes';

export const configStore = new ConfigStore({
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  LOG_SYNC_DELAY_SEC: 60 * 60 * 12, // 12 hours
  MAX_QUEUE_TIME_MS: 60 * 60 * 1000,
  APP_CODE: 'chrome-extension-v3',
  DEFAULT_APP_VERSION: '4.0.0',
  OAUTH_REDIRECT_URL: 'https://extensions.fireflies.ai/_oauth/google',
  USER_SERVICE_HOST: {
    staging: 'https://user-service-rest.fireflies.dev',
    prod: 'https://user-service-rest.fireflies.ai',
  },
  USER_AUTH_PATH: '/auth/chromeExtension/login',
  USER_AUTH_REFRESH_PATH: '/auth/chromeExtension/token',
  USER_ACCOUNT_INFO_PATH: '/user/query?select=freeMeetingsLeft,paidUser',
  SENTRY_DSN_URL: 'https://16ca91ad987228bd48cbc9d2e5161c90@o207331.ingest.us.sentry.io/4507652828233728',
  FF_WEBSTORE_URL:
    'https://chrome.google.com/webstore/detail/fireflies-meeting-recorde/meimoidfecamngeoanhnpdjjdcefoldn?hl=en',
  ASKFRED_GUIDE_URL: 'https://guide.fireflies.ai/hc/en-us/articles/14533653027345',
  FF_WORK_VIDEO: 'https://www.youtube.com/embed/rYBZ4fAdK08?si=26b6RPy3TsXEDuaW',
  FF_BOT_GUIDE_URL: 'https://guide.fireflies.ai/hc/en-us/articles/360020107997-How-to-Invite-Fireflies-to-Meetings',
  ASKFRED_PRICING_URL: 'https://app.fireflies.ai/?action=subscribe-ask-fred&ref=chrome-extension',
  FF_HELP_URL: 'https://fireflies.ai/security',
  FF_TERMS_URL: 'https://fireflies.ai/terms-of-service.pdf',
  FF_PRICING_URL: 'https://app.fireflies.ai/upgrade?pwl=chrome_extn_V2',
  MAX_LOGS_IN_STORAGE: 50000,
  MEDIA_STORAGE: {
    staging: 'https://media-storage.fireflies.dev',
    prod: 'https://media-storage.firefliesapp.com',
  },
  CALENDAR_FF: {
    staging: 'https://calendar.fireflies.dev/v1/events',
    prod: 'https://calendar.firefliesapp.com/v1/events',
  },
  BOT_NAME: {
    staging: 'Fireflies.dev Notetaker',
    prod: 'Fireflies.ai Notetaker',
  },
  LOG_STORE_KEY: 'ff_log_store',
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
    staging: 'DXl7ruGOTOWP9VmXDDaEJ4AkCX8DF5sC',
    prod: 'wAxZOoK9icqcLhCBS5itONPrNrefnC00',
  },
  GRAPHQL_HOST: {
    staging: 'https://gateway.fireflies.dev/graphql',
    prod: 'https://gateway.fireflies.ai/graphql',
  },
});
