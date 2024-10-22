import moment from 'moment';

const isPreAlpha = false;
export const isProduction = !isPreAlpha && process.env.NODE_ENV === 'production';

export const AskFredBlackList = ['https://app.fireflies.ai', 'https://app.fireflies.dev'];

export const SettingUrls = {
  NOTEBOOK: 'https://app.fireflies.ai/notebook',
  HELP: 'https://help.fireflies.ai',
};

export enum Msg {
  TAB_UPDATED = 'TAB_UPDATED',
  EXTENSION_ID = 'EXTENSION_ID',
  USER_LOGGED_IN = 'USER_LOGGED_IN',
  SHOW_MANUAL_POPUP = 'SHOW_MANUAL_POPUP',
  START_AUTO_RECORDING = 'START_AUTO_RECORDING',
  STOP_MANUAL_RECORDING = 'STOP_MANUAL_RECORDING',
  START_MANUAL_RECORDING = 'START_MANUAL_RECORDING',
  HIDE_SHARE_SETTINGS_PANEL = 'HIDE_SHARE_SETTINGS_PANEL',
  SHOW_SHARE_SETTINGS_PANEL = 'SHOW_SHARE_SETTINGS_PANEL',
  CREATE_GMEET_NOTIFICATION = 'CREATE_GMEET_NOTIFICATION',
  CREATE_SCREEN_NOTIFICATION = 'CREATE_SCREEN_NOTIFICATION',
  CAPTION_ADDED = 'CAPTION_ADDED',
  HIDE_RTP_ON_STOP_RECORDING = 'HIDE_RTP_ON_STOP_RECORDING',
}

export const iconCheckerLimit = 6;
export const maxTranscodingTries = 10;
export const maxUploadingTries = 10;

export const FRED_EMAIL = 'fred@fireflies.ai';
export const EventDifferenceLimit = 2; // 2 hours

export enum SharePlatforms {
  Loom = 'Loom',
  Soapbox = 'Soapbox',
}

export enum StatusType {
  success = 'success',
  warning = 'warning',
  error = 'error',
}

export enum StatusSize {
  large = 'large',
  medium = 'medium',
  small = 'small',
}

export const defaultTime = '00:00';

export const EmailValidator =
  /* eslint-disable-next-line max-len */
  // eslint-disable-next-line no-useless-escape
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export enum MeetingOrigin {
  GMEET = 'GMEET',
  YOUTUBE = 'YOUTUBE',
}

export const AllowedOrigins = {
  GMEET: 'https://meet.google.com',
};

export const SHOW_FLOATING_ICON_AFTER = 5000; // 5 seconds;

export enum ApiCallType {
  GET = 'GET',
  POST = 'POST',
}

export const DEV_BOT_NAME = 'Fireflies.dev Notetaker';
export const PROD_BOT_NAME = 'Fireflies.ai Notetaker';
export const DEFAULT_BOT_NAME = isProduction ? PROD_BOT_NAME : DEV_BOT_NAME;

export const YoutubeSummary = {
  origin: 'https://www.youtube.com',
  path: '/watch',
  param: 'v',
  adClassName: 'ytp-ad-player-overlay',
  subtitleBtn: 'button.ytp-subtitles-button',
  disableCaptionText: 'unavailable',
  panelId: 'summaryPanel',
  hiddenPanelId: 'hiddenSummaryPanel',
  screenShotPanelId: 'screenShotPanel',
  dailyCreditLimit: 20,
  dateFormat: 'DD_MM_YYYY',
};

export const AskFred = {
  panelId: 'summaryPanel',
  panelInputId: 'summaryPanelInput',
  hiddenPanelId: 'hiddenSummaryPanel',
  screenShotPanelId: 'screenShotPanel',
  floatingBtnId: 'ask-fred-floating-button',
  chatPanelId: 'ask-fred-chat-panel-id',
  hiddenChatPanelId: 'ask-fred-hidden-chat-panel-id',
  dragBtnId: 'ask-fred-drag-floating-button',
  maxInputLength: 240,
  lowAiCredit: 3,
  customizedAnswers: {
    initialMessage: "Hi $NAME,\n I'm an AI assistant that can summarize and answer questions about this page.",
    initialSuggestions: [
      {
        answer: 'Paragraph Summary',
        id: 'suggestion1',
        question: 'Summarize this transcript',
        isSuggestion: true,
        isImmdiateClick: true,
      },
      {
        id: 'suggestion2',
        answer: 'Bullet Point Summary',
        question: 'Summarize this transcript in numbered bullet points',
        isSuggestion: true,
        isImmdiateClick: true,
      },
    ],
    unAuthUser: 'Something went wrong, Kindly refresh your tab or reopen AskFred chat panel.',
    invalidUser: 'You are not eligible to use AskFred.',
    inputLarge: 'Input too large. Try on a different webpage',
  },
};

export enum SummaryActivePanel {
  Saved = 'Saved',
  Save = 'Save',
  Share = 'Share',
  Copy = 'Copy',
  ScreenShot = 'ScreenShot',
}
export enum SummaryError {
  NO_CAPTION = 'no caption',
  LIMIT_EXCEEDED = 'Received status code 413',
  FAILED = 'Failed to fetch',
  INVALID_USER = 'Invalid authorization',
  NO_CREDITS = 'no credits',
  NO_USER = 'no user found',
  TIMEOUT = 'api call timeout',
  NO_SUMMARY = 'no summary available',
}

export enum AiAccountTypes {
  GROWTH_BOOK = 'GROWTH_BOOK',
  FREE_TRIAL = 'FREE_TRIAL',
  FREE_CREDITS = 'FREE_CREDITS',
  SUBSCRIPTION = 'SUBSCRIPTION',
  NONE = 'NONE',
}
export enum AskFredAnimationClass {
  AppearLeft = 'appearLeft',
  DisappearLeft = 'disappearLeft',
  AppearRight = 'appearRight',
  DisappearRight = 'disappearRight',
}

export const AskFredTrialAccounts = [AiAccountTypes.GROWTH_BOOK, AiAccountTypes.FREE_TRIAL];
export const MeetRegex = /https:\/\/meet\.google\.com\/[a-z]+-[a-z]+-[a-z]+/;

export const WelcomeMarqueeElements = {
  GMAIL: {
    icon: 'gmail',
    title: 'Gmail',
    body: 'Suggest a formal reply to this email.',
  },
  MEDIUM: {
    icon: 'medium',
    title: 'Medium',
    body: 'Summarize article into bullet points.',
  },
  NOTION: {
    icon: 'notion',
    title: 'Notion',
    body: 'Are there any mentions related to the new growth plan?',
  },
  WIKIPEDIA: {
    icon: 'wikipedia',
    title: 'Wikipedia',
    body: 'List out S. S. Rajamouli Filmography.',
  },
  YOUTUBE: {
    icon: 'youtube',
    title: 'Youtube',
    body: 'Suggest a formal reply to this email.',
  },
  DOCS: {
    icon: 'docs',
    title: 'Google Docs',
    body: 'Summarize article into bullet points.',
  },
  MEET: {
    icon: 'meet',
    title: 'Meet',
    body: 'Are there any mentions related to the new growth plan?',
  },
  TWITTER: {
    icon: 'twitter',
    isPng: true,
    title: 'Twitter',
    body: 'List out S. S. Rajamouli Filmography.',
  },
};

export type MeetingState = 'NOT_STARTED' | 'READY' | 'STARTED' | 'FORCE_STOPPED' | 'STOPPED' | 'ENDED';

export enum StopMeetingSource {
  POPUP = 'Popup',
  GMEET = 'gmeet-ui',
  END_TIME = 'end-meeting-time',
  TAB_UPDATE = 'tab-updated-or-closed',
  REFRESH = 'extension-refreshed',
}

export const GmeetUiSelectors = {
  VIDEO_LAYOUT: "div[class^='axUSnc']",
  SPEAKER_ACTIVE_CONTAINER_CLASS: '.lH9pqf.atLQQ.kssMZb',
  SPEAKER_ACTIVE_NAME_CLASS: '.XEazBc.adnwBd .EY8ABd-OWXEXe-TAWMXe',
};

export const MIN_SPEAKER_LABEL_DURATION_MS = 100;
export const MAX_LABEL_DISTANCE_MS = 100;
export const MARK_SILENCE_KEY = 'QW5fbUFySy0wMC1TaUxlTmNFLXAtS2VZ';
export const MAX_SILENCE_DURATION_MS = 2000;

export enum CaptionSource {
  DOM = 'dom',
  CAPTIONS = 'google_meet_captions',
  HYBRID = DOM + '+' + CAPTIONS,
}

export const defaultApplicationState = {
  options: {
    autoCapture: true,
    enableAskFredPanel: false,
    enableRealtimePanel: true,
    allowShareSettings: true,
    captureWhenFredJoined: true,
  },
  limits: {
    youtubeSummary: {
      date: moment().format(YoutubeSummary.dateFormat),
      usedCredits: 0,
    },
  },
};

export const unathenticatedUserErrors = ['account has been cancelled', 'unable to refresh tokens'];
