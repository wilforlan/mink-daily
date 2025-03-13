import { databaseService, userService } from ".";
import { contentProcessorService } from "./content-processor.service";

interface JourneyJobCreateParams {
  url: string;
  title: string;
  content: string;
  direction: string;
  previousEntries?: any[];
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
        url: params.url,
        title: params.title,
        previousEntries: params.previousEntries || []
      });

      // Generate badges
      const badges = [
        `${Math.round(result.relevanceScore * 100)}% Relevant`,
        result.relevanceScore > 0.7 ? "High Value" : "Supplementary",
        result.readingDepth
      ];

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
        cost: result.cost || {
          prompt_cost: 0,
          completion_cost: 0,
          total_cost: 0
        },
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
    
    // Update the job
    await databaseService.db.JourneyJobs.update(id, updateData);
    
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
  convertToJourneyEntry(job: any) {
    return {
      title: job.title,
      url: job.url,
      content: job.content,
      highlights: JSON.parse(job.highlights || "[]"),
      badges: JSON.parse(job.badges || "[]"),
      timestamp: job.timestamp,
      summary: {
        keyPoints: JSON.parse(job.keyPoints || "[]"),
        pros: JSON.parse(job.pros || "[]"),
        cons: JSON.parse(job.cons || "[]"),
        statistics: JSON.parse(job.statistics || "[]"),
        steps: JSON.parse(job.steps || "[]")
      },
      relevanceScore: job.relevanceScore,
      context: {
        relationToDirection: job.contextualInsight,
        previousPageConnections: JSON.parse(job.connections || "[]")
      }
    };
  }
}

export const journeyService = new JourneyService(); 