import { databaseService, userService } from ".";
import { contentProcessorService } from "./content-processor.service";
import { SegmentAnalyticsEvents, analyticsTrack } from '@/src/background/commons/analytics';
import type { UpdateSpec } from 'dexie';

// Define Cost interface
interface Cost {
  prompt_cost: number;
  completion_cost: number;
  total_cost: number;
}

interface JourneyEntry {
  title: string;
  url: string;
  content: string;
  highlights: string[];
  badges: string[];
  timestamp: number;
  summary: {
    keyPoints: string[];
    pros: string[];
    cons: string[];
    statistics: string[];
    steps?: string[];
    connections: {
      previousPages: string[];
      nextPages: string[];
      relatedTopics: string[];
    };
  };
  relevanceScore: number;
  context: {
    relationToDirection: string;
    previousPageConnections: string[];
    journeyContext?: {
      position: number;
      totalPages: number;
      theme: string;
      progress: {
        percentage: number;
        description: string;
      };
    };
    insights: {
      patterns: string[];
      learnings: string[];
      recommendations: string[];
    };
  };
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

interface JourneyJobCreateParams {
  url: string;
  title: string;
  content: string;
  direction: string;
  previousEntries: any[];
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

interface JourneyJobUpdateParams {
  id: string;
  status?: string;
  error?: string;
  [key: string]: any;
}

class JourneyService {
  /**
   * Create a new journey job
   * @param params Job creation parameters
   * @returns The created job
   */
  async createJourneyJob(params: JourneyJobCreateParams) {
    const user = await userService.getAccountInfo();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const now = new Date();
    const timestamp = now.getTime();
    const domain = new URL(params.url).hostname;

    // Create a new journey job with initial status
    const journeyJob = {
      userId: user.id,
      url: params.url,
      domain,
      title: params.title,
      direction: params.direction,
      content: params.content,
      highlights: "",
      keyPoints: "",
      pros: "",
      cons: "",
      statistics: "",
      steps: "",
      relevanceScore: 0,
      readingDepth: "",
      contextualInsight: "",
      connections: "",
      badges: "",
      timestamp,
      cost: {
        prompt_cost: 0,
        completion_cost: 0,
        total_cost: 0
      },
      createdAt: now,
      updatedAt: now,
      createAtTs: timestamp,
      updatedAtTs: timestamp,
      status: "pending",
      error: ""
    };

    // Save to database
    const id = await databaseService.db.JourneyJobs.add(journeyJob as any);
    
    await analyticsTrack(SegmentAnalyticsEvents.USER_JOURNEY_ENTRY_CREATED, {
      journeyId: id,
      url: params.url,
      title: params.title,
      direction: params.direction,
      timestamp: new Date().toISOString(),
      totalPreviousEntries: params.previousEntries?.length || 0,
    });

    // Process the job asynchronously
    this.processJourneyJob(id as string, params);
    
    return {
      id,
      ...journeyJob
    };
  }

  /**
   * Process a journey job
   * @param jobId The job ID
   * @param params Processing parameters
   */
  private async processJourneyJob(jobId: string, params: JourneyJobCreateParams) {
    try {
      // Update job status to processing
      await this.updateJourneyJob({
        id: jobId,
        status: "processing"
      });

      // Process the content
      const result = await contentProcessorService.processPage({
        content: params.content,
        direction: params.direction,
        currentUrl: params.url,
        pageTitle: params.title,
        previousEntries: params.previousEntries || [],
        journeyContext: params.journeyContext
      });

      // Generate badges
      const badges = [
        `${Math.round(result.relevanceScore * 100)}% Relevant`,
        result.relevanceScore > 0.7 ? "High Value" : "Supplementary",
        result.readingDepth
      ];
      const cost = result.cost || {
        prompt_cost: 0,
        completion_cost: 0,
        total_cost: 0
      };

      await analyticsTrack(SegmentAnalyticsEvents.USER_JOURNEY_ENTRY_SUCCESS, {
        journeyId: jobId,
        url: params.url,
        title: params.title,
        direction: params.direction,
        timestamp: new Date().toISOString(),
        totalPreviousEntries: params.previousEntries?.length || 0,
        cost,
      });

      // Update the job with the processed content
      await this.updateJourneyJob({
        id: jobId,
        highlights: JSON.stringify(result.highlights),
        keyPoints: JSON.stringify(result.keyPoints),
        pros: JSON.stringify(result.pros),
        cons: JSON.stringify(result.cons),
        statistics: JSON.stringify(result.statistics),
        steps: JSON.stringify(result.steps || []),
        relevanceScore: result.relevanceScore,
        readingDepth: result.readingDepth,
        contextualInsight: result.contextualInsight,
        connections: JSON.stringify(result.connections),
        badges: JSON.stringify(badges),
        // Save the cost information
        cost,
        status: "completed"
      });

      // Log the cost for analytics
      if (result.cost) {
        console.log(`Journey job ${jobId} completed with cost:`, result.cost);
      }
    } catch (error) {
      console.error("Error processing journey job:", error);
      
      // Update job with error
      await this.updateJourneyJob({
        id: jobId,
        status: "failed",
        error: error.message || "Unknown error"
      });

      await analyticsTrack(SegmentAnalyticsEvents.USER_JOURNEY_ENTRY_FAILED, {
        journeyId: jobId,
        url: params.url,
        title: params.title,
        direction: params.direction,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update a journey job
   * @param params Update parameters
   * @returns The updated job
   */
  async updateJourneyJob(params: JourneyJobUpdateParams) {
    const { id, ...updateData } = params;
    
    // Add update timestamp
    const now = new Date();
    updateData.updatedAt = now;
    updateData.updatedAtTs = now.getTime();
    
    // Cast status to the correct type if it exists
    if (updateData.status) {
      updateData.status = updateData.status as "pending" | "processing" | "completed" | "error";
    }
    
    // Update the job
    await databaseService.db.JourneyJobs.update(id, updateData as UpdateSpec<JourneyJob>);
    
    // Return the updated job
    return this.getJourneyJob(id);
  }

  /**
   * Get a journey job by ID
   * @param id The job ID
   * @returns The journey job
   */
  async getJourneyJob(id: string) {
    return databaseService.db.JourneyJobs.get(id);
  }

  /**
   * Get journey jobs by URL
   * @param url The URL
   * @returns Journey jobs for the URL
   */
  async getJourneyJobsByUrl(url: string) {
    return databaseService.db.JourneyJobs
      .where("url")
      .equals(url)
      .toArray();
  }

  /**
   * Get journey jobs by domain
   * @param domain The domain
   * @returns Journey jobs for the domain
   */
  async getJourneyJobsByDomain(domain: string) {
    return databaseService.db.JourneyJobs
      .where("domain")
      .equals(domain)
      .toArray();
  }

  /**
   * Get journey jobs by direction
   * @param direction The direction
   * @returns Journey jobs for the direction
   */
  async getJourneyJobsByDirection(direction: string) {
    return databaseService.db.JourneyJobs
      .where("direction")
      .equals(direction)
      .toArray();
  }

  /**
   * Get the latest journey jobs
   * @param limit The maximum number of jobs to return
   * @returns The latest journey jobs
   */
  async getLatestJourneyJobs(limit: number = 10) {
    return databaseService.db.JourneyJobs
      .orderBy("timestamp")
      .reverse()
      .limit(limit)
      .toArray();
  }

  /**
   * Convert a journey job to a journey entry for the UI
   * @param job The journey job
   * @returns The journey entry
   */
  convertToJourneyEntry(job: JourneyJob): JourneyEntry {
    // Helper function to safely parse JSON strings
    const parseJsonArray = (jsonString: string | undefined | any[]): any[] => {
      if (!jsonString) return [];
      if (Array.isArray(jsonString)) return jsonString;
      try {
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Error parsing JSON:", e);
        return [];
      }
    };

    // Helper function to safely parse JSON objects
    const parseJsonObject = (jsonString: string | undefined | object): any => {
      if (!jsonString) return {};
      if (typeof jsonString !== 'string') return jsonString;
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        console.error("Error parsing JSON object:", e);
        return {};
      }
    };

    // Parse all JSON strings into their appropriate types
    const highlights = parseJsonArray(job.highlights);
    const badges = parseJsonArray(job.badges);
    const keyPoints = parseJsonArray(job.keyPoints);
    const pros = parseJsonArray(job.pros);
    const cons = parseJsonArray(job.cons);
    const statistics = parseJsonArray(job.statistics);
    const steps = parseJsonArray(job.steps);
    
    // Parse connections
    const connections = parseJsonObject(job.connections);
    const previousPages = parseJsonArray(connections?.previousPages);
    const nextPages = parseJsonArray(connections?.nextPages);
    const relatedTopics = parseJsonArray(connections?.relatedTopics);
    
    // Parse insights
    const contextualInsight = job.contextualInsight || "";
    
    // Since the JourneyJob doesn't have a context property, we'll create it
    const relationToDirection = contextualInsight;
    const previousPageConnections = [];
    
    // Parse patterns, learnings, recommendations from the database
    // These might be stored in a different way, so we'll use empty arrays for now
    const patterns = [];
    const learnings = [];
    const recommendations = [];

    return {
      title: job.title,
      url: job.url,
      content: job.content,
      highlights: highlights,
      badges: badges,
      timestamp: job.timestamp,
      summary: {
        keyPoints: keyPoints,
        pros: pros,
        cons: cons,
        statistics: statistics,
        steps: steps,
        connections: {
          previousPages: previousPages,
          nextPages: nextPages,
          relatedTopics: relatedTopics
        }
      },
      relevanceScore: job.relevanceScore || 0,
      context: {
        relationToDirection: relationToDirection,
        previousPageConnections: previousPageConnections,
        journeyContext: job.journeyContext,
        insights: {
          patterns: patterns,
          learnings: learnings,
          recommendations: recommendations
        }
      }
    };
  }

  async updateJourneyJobStatus(jobId: string, status: "pending" | "processing" | "completed" | "error", error?: string) {
    try {
      const updateData: UpdateSpec<JourneyJob> = {
        status: status
      };
      
      if (error) {
        updateData.error = error;
      }
      
      await databaseService.db.JourneyJobs.update(jobId, updateData);
    } catch (error) {
      console.error("Error updating journey job status:", error);
      throw error;
    }
  }

  /**
   * Get all journey jobs for the current day, grouped by direction
   * @returns Journey jobs grouped by direction
   */
  async getDailyJourneyMap() {
    // Get start and end of current day
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get all journey jobs for today
    const journeyJobs = await databaseService.db.JourneyJobs
      .where('createAtTs')
      .between(startOfDay.getTime(), endOfDay.getTime())
      .toArray();
    
    // Group by direction
    const journeyMap = journeyJobs.reduce((map, job) => {
      if (!map[job.direction]) {
        map[job.direction] = [];
      }
      map[job.direction].push(job);
      return map;
    }, {} as Record<string, JourneyJob[]>);
    
    // Calculate stats for each direction
    const journeyStats = Object.entries(journeyMap).map(([direction, jobs]) => {
      // Calculate average relevance score
      const avgRelevanceScore = jobs.reduce((sum, job) => sum + (job.relevanceScore || 0), 0) / jobs.length;
      
      // Count completed jobs
      const completedJobs = jobs.filter(job => job.status === "completed").length;
      
      // Count unique domains
      const uniqueDomains = new Set(jobs.map(job => job.domain)).size;
      
      // Get the latest job timestamp
      const latestTimestamp = Math.max(...jobs.map(job => job.timestamp));
      
      return {
        direction,
        jobCount: jobs.length,
        completedJobCount: completedJobs,
        uniqueDomains,
        avgRelevanceScore,
        latestTimestamp,
        // Convert jobs to journey entries for the UI
        entries: jobs.map(job => this.convertToJourneyEntry(job))
      };
    });
    
    return journeyStats;
  }
}

export const journeyService = new JourneyService(); 