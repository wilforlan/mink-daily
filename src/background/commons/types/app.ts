import type { SegmentAnalyticsEvents } from '../utils/analytics';

export interface ApplicationOptions {
  autoCapture: boolean;
  enableAskFredPanel: boolean;
  enableRealtimePanel: boolean;
  allowShareSettings: boolean;
  captureWhenFredJoined: boolean;
  event?: SegmentAnalyticsEvents;
}

export interface ApplicationState {
  options: ApplicationOptions;
  limits: {
    youtubeSummary: {
      date: string;
      usedCredits: number;
    };
  };
}
