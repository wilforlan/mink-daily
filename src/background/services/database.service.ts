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
  hasSentEmail: string;
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
  createAtTs: number;
  updatedAtTs: number;
}

interface Notification {
  id: string;
  notificationId: string;
  title: string;
  body: string;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
  isRead: string;
}

interface JourneyJob {
  id: string;
  userId: string;
  url: string;
  domain: string;
  title: string;
  direction: string;
  content: string;
  highlights: string;
  keyPoints: string;
  pros: string;
  cons: string;
  statistics: string;
  steps: string;
  relevanceScore: number;
  readingDepth: string;
  contextualInsight: string;
  connections: string;
  badges: string;
  timestamp: number;
  cost: Cost;
  createdAt: Date;
  updatedAt: Date;
  createAtTs: number;
  updatedAtTs: number;
  status: "pending" | "processing" | "completed" | "error";
  error?: string;
  journeyContext?: {
    position: number;
    totalPages: number;
    theme: string;
    progress: {
      percentage: number;
      description: string;
    };
  };
}

export class Database extends Dexie {
  public PageData!: Table<PageData>;

  public SummaryResults!: Table<SummaryResults>;

  public ChatMessages!: Table<ChatMessages>;

  public Notifications!: Table<Notification>;
  
  public JourneyJobs!: Table<JourneyJob>;

  constructor() {
    super('mink-db');
    this.version(7).stores({
      SummaryResults: '++id, summary, analytics, insights, suggestions, createdAt, updatedAt, createAtTs, updatedAtTs, cost, hasSentEmail',
      ChatMessages: '++id, role, content, createdAt, updatedAt',
      PageData: '++id, title, url, content, description, isProcessed, createdAt, updatedAt, origin, contentSummary, createAtTs, updatedAtTs',
      Notifications: '++id, notificationId, title, body, endTime, createdAt, updatedAt, isRead',
      JourneyJobs: '++id, userId, url, domain, title, direction, relevanceScore, readingDepth, timestamp, createdAt, updatedAt, createAtTs, updatedAtTs, status',
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
