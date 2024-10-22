import { Msg, MeetingOrigin, StopMeetingSource } from '../misc';
import type { Event } from '@sentry/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnknownType = any;
export type UnknownPromiseType = Promise<UnknownType>;
export type ObjectType = { [key: string]: UnknownType };

export interface NotificationBtn {
  title: string;
}

export enum LLMPlatform {
    OPEN_AI = 'openai',
    ANTROPHIC = 'anthropic',
}

export interface ILoginUserRes {
  email: string;
  llmApiKey: string;
  llmPlatform: LLMPlatform;
}

export interface ICurrentUser extends ILoginUserRes {
  userId: string;
}

export interface IAppNotification {
  title: string;
  message: string;
}

export interface NotificationInterface {
  title: string;
  message: string;
  iconUrl: string;
}

export interface IApplicationSettings {
  autoCapture?: boolean;
  enableAskFredPanel?: boolean;
  allowShareSettings?: boolean;
  captureWhenFredJoined?: boolean;
  enableRealtimePanel?: boolean;
}

export interface ListenerInterface {
  action: Msg;
  data: UnknownType;
}

export interface IRequest {
  payload: UnknownType;
  route: string;
}

export interface ISentryArgs {
  dsn: string;
  autoSessionTracking: boolean;
  integrations: Array<UnknownType>;
  release: string;
  tracesSampleRate: number;
  beforeSend: (event: Event) => Event;
}

export interface IUpdateSettingParam {
  key: string;
  value: boolean;
}
export interface IPopupSettings {
  openSettings: (openSettings: boolean) => void;
  openMeetings: (openMeetings: boolean) => void;
  applicationSettings: IApplicationSettings;
  updateSettings: (val: IUpdateSettingParam) => void;
}

export interface ICreateNotification {
  type?: string;
  heading: string;
  subHeading: string;
  text?: string;
  btnText?: string;
  onClick?: () => void;
  icon?: JSX.Element;
  onClose?: () => void;
  showNarrowBtns?: boolean;
  ttlSeconds?: number;
}

export interface IEventNotification {
  notification: ICreateNotification;
}
export interface IAllEventNotification {
  notification: Array<ICreateNotification>;
}

export type IntervalInterface = number | NodeJS.Timer | null;


