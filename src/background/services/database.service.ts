import type { AudioStore, CaptionStore, ChatStore, Meeting, SpeakerLabel } from '@/src/background/commons/types/meeting';
import { Dexie } from 'dexie';
import type { Table } from 'dexie';

export class Database extends Dexie {
  public meetings!: Table<Meeting>;

  public audio!: Table<AudioStore>;

  public captions!: Table<CaptionStore>;

  public chats!: Table<ChatStore>;

  public speakerLabels!: Table<SpeakerLabel>;

  constructor() {
    super('ff-database');
    this.version(5).stores({
      meetings:
        '++id, version, parse_id, url, has_cc, has_audio, has_uploaded_cc, audio_segments, time_ts, created_at, uploaded_at',
      audio:
        '++id, meeting_id, sequence_number, data, transcoded_data, has_uploaded, has_transcoded, uploaded_at, created_at',
      captions: '++id, messageId, meeting_id',
      chats: '++id, messageId, meeting_id',
      shownNotifications: '++id, notificationId, endTime',
    });
  }
}

export class DatabaseService {
  private database: Database;

  private hasDatabaseClosed = false;

  constructor() {
    this.database = new Database();
    this.init();
  }

  private init() {
    this.addListeners();
    this.hasDatabaseClosed = false;
  }

  private addListeners() {
    this.database.on('close', () => {
      this.hasDatabaseClosed = true;
    });
  }

  get db() {
    if (this.hasDatabaseClosed) {
      this.database = new Database();
      this.init();
    }

    return this.database;
  }
}
