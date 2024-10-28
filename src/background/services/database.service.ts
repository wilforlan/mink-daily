import { Dexie } from 'dexie';
import type { Table } from 'dexie';


interface Cost {
  prompt_cost: number;
  completion_cost: number;
  total_cost: number;
}

interface SummaryResults {
  id: string;
  summary: string;
  analytics: string;
  insights: string;
  suggestions: string;
  createdAt: Date;
  updatedAt: Date;
  cost: Cost;
  createAtTs: number;
  updatedAtTs: number;
}

interface ChatMessages {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PageData {
  id: string;
  title: string;
  url: string;
  content: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  origin: string;
  contentSummary: string; // maybe or maybe not used,
  isProcessed: string;
}

export class Database extends Dexie {
  public PageData!: Table<PageData>;

  public SummaryResults!: Table<SummaryResults>;

  public ChatMessages!: Table<ChatMessages>;

  constructor() {
    super('mink-db');
    this.version(5).stores({
      SummaryResults: '++id, summary, analytics, insights, suggestions, createdAt, updatedAt, createAtTs, updatedAtTs, cost',
      ChatMessages: '++id, role, content, createdAt, updatedAt',
      PageData: '++id, title, url, content, description, isProcessed, createdAt, updatedAt, origin, contentSummary',
      shownNotifications: '++id, notificationId, endTime, createdAt, updatedAt',
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
