import type { StopMeetingSource } from '@/misc';

type MeetingCreatedBy = 'auto-record' | 'pop-up' | 'never';
type MeetingStoppedBy = 'auto-meeting-exit' | 'tab-closed' | 'manual-user-stop';

export interface MeetingMetadata {
  tabId: number;
  createdBy: MeetingCreatedBy;
  meetingId: string;
  captions: CaptionStore[];
  lastReceivedLabel?: SpeakerLabel | null;
  audioBuffers: Blob[];
  isRecording: boolean;
  createdAt: number;
  stoppedAt?: number;
  stoppedBy?: MeetingStoppedBy;
  recordingStartedAt: number;
}

export const MeetingEventListenerKey = 'meeting-update-created-event-ff';
export interface MeetingCreationParams {
  meeting: Partial<Meeting>;
  createdAt?: number;
  createdBy?: MeetingCreatedBy;
  stoppedAt?: number;
  stoppedBy?: MeetingStoppedBy;
  isAutoCaptured?: boolean;
}

export type Bool = 0 | 1;

export enum MeetingState {
  INITIALIZED = 'INITIALIZED',
  RECORDING = 'RECORDING',
  RECORDING_STOPPED = 'RECORDING_STOPPED',

  TRANSCODING = 'TRANSCODING',
  TRANSCODED = 'TRANSCODED',

  ENQUEUED_TO_UPLOAD = 'ENQUEUED_TO_UPLOAD',
  UPLOADING = 'UPLOADING',
  COMPLETED = 'COMPLETED',
  IRRECOVERABLE = 'IRRECOVERABLE',

  STOPPED_BY_FRED = 'STOPPED_BY_FRED',
  UPLOADING_FAILED = 'UPLOADING_FAILED',
  DURATION_ERROR = 'DURATION_ERROR',
  EMPTY_AUDIO_FILE = 'EMPTY_AUDIO_FILE',
  NOT_ENOUGH_AUDIO_SEGMENT = 'NOT_ENOUGH_AUDIO_SEGMENT',
  AUDIO_LOST_FROM_STORE = 'AUDIO_LOST_FROM_STORE',
  AUDIO_TRANSCODE_ERROR = 'AUDIO_TRANSCODE_ERROR',
  TRANSCODE_FAILED_MAX_RETRIED = 'TRANSCODE_FAILED_MAX_RETRIED',
}

export const MeetingErrStates = [
  MeetingState.IRRECOVERABLE,
  MeetingState.DURATION_ERROR,
  MeetingState.EMPTY_AUDIO_FILE,
  MeetingState.NOT_ENOUGH_AUDIO_SEGMENT,
  MeetingState.AUDIO_LOST_FROM_STORE,
  MeetingState.AUDIO_TRANSCODE_ERROR,
];

export interface MeetingAttendee {
  fullName: string;
  id: string;
  image: string;
  name: string;
}

export interface Meeting {
  /** local unique meeting identifier */
  id: string;
  meeting_analytics?: any;
  /** the meeting id on server */
  parse_id?: string;
  version?: number;
  email: string;
  title: string;
  url: string;
  has_cc: Bool;
  has_audio: Bool;
  has_recovered?: Bool;
  has_uploaded_cc: Bool;
  has_recorded?: Bool;
  has_processed?: Bool;
  has_uploaded_speakers?: Bool;
  has_uploaded_audio?: Bool;
  audio_segments?: number;
  duration: number;
  audio_file?: Blob;
  created_at: Date;
  recordingStartedTime: number;
  recordingEndedTime: number;
  uploaded_at?: Date;
  last_updated_at: Date;
  attendees?: MeetingAttendee[];
  isFredOnCall: boolean;
  state: MeetingState;
  has_credits: Bool;
  is_auto_captured?: Bool;
  upload_progress?: number;
  speaker_labelling_algorithm?: string;
  emailList?: string[];
}

export interface AudioStore {
  id?: string;
  meeting_id: string;
  sequence_number: number;
  audio: Blob;
  has_uploaded?: Bool;
  uploaded_at?: Date;
  created_at: Date;
}

interface IMeetUser {
  fullName: string;
  id: string;
  image: string;
  name: string;
}

interface ILocalTime {
  time: number;
  endTime: number;
}

export interface IRawCaptions {
  caption: string;
  firstReceiveTs: number;
  endTs: number;
  messageId: number;
  sequence: number;
  updatedAt: number;
  user: IMeetUser;
}

export interface IRawChatMsg {
  messageId: string;
  timestamp: number;
  msg: { text: string };
  user: IMeetUser;
}

export interface IMeetCaptions extends IRawCaptions, ILocalTime {}
export interface CaptionStore extends IMeetCaptions {
  meeting_id: string;
  id: string;
}

export interface ChatStore {
  meeting_id: string;
  text: string;
  user: {
    image: string;
    name: string;
  };
  createdAt: Date;
  meetingTs: number;
  id: string;
}

export interface AddCaptionParams {
  id: string;
  caption: IRawCaptions;
}

export interface AddChatMessageParams {
  id: string;
  chat: IRawChatMsg;
}

export interface AddAudioParam {
  id: string;
  audio: string;
}

export interface StartMeetingRecordingParams {
  id: string;
  tabId: number;
}

export interface StopMeetingRecordingParams {
  id?: string;
  emailList?: string[];
  skipSubmission?: boolean;
  stoppedManually?: boolean;
  stoppedByFred?: boolean;
  source: StopMeetingSource;
}

export interface SubmitMeetingRecordingParams {
  id?: string;
  emailList?: string[];
  title?: string;
  from?: string;
}

export interface SpeakerWatcher {
  __ff__hasObserver?: boolean;
  __ff__observer?: MutationObserver;
  __ff__user?: string;
}

export interface SpeakerIndicator {
  key: string;
  speakerName: string;
  node: Element & SpeakerWatcher;
  data: [any];
  dataNode: Element;
  dataNodeKey: string;
}

export interface SpeakerActivityInfo {
  id: number;
  key: string;
  speakerName: string;
  data: any[];
  timestamp: number;
}

export interface SpeakerLabel {
  meetingId: string;
  speaker: string;
  speakerId: number;
  startTime: number;
  endTime: number;
  key?: string;
  data?: any[];
}
