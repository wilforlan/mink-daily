import { userService } from "."
import OpenAIService from "./openai.service"

interface ProcessPageRequest {
  content: string;
  direction: string;
  currentUrl: string;
  pageTitle: string;
  previousEntries: Array<{
    title: string;
    content: string;
    summary: {
      keyPoints: string[];
      pros: string[];
      cons: string[];
      statistics: string[];
      steps?: string[];
      connections?: {
        previousPages: string[];
        nextPages: string[];
        relatedTopics: string[];
      };
    };
    context: {
      relationToDirection: string;
      previousPageConnections?: string[];
      journeyContext?: {
        position: number;
        totalPages: number;
        theme: string;
        progress: {
          percentage: number;
          description: string;
        };
      };
      insights?: {
        patterns: string[];
        learnings: string[];
        recommendations: string[];
      };
    };
  }>;
  journeyContext: {
    position: number;
    totalPages: number;
    theme: string;
    progress: {
      percentage: number;
      description: string;
    };
  };
}

// Define Cost interface
interface Cost {
  prompt_cost: number;
  completion_cost: number;
  total_cost: number;
}

interface ProcessedContent {
  summary: string;
  highlights: string[];
  keyPoints: string[];
  pros: string[];
  cons: string[];
  statistics: string[];
  steps?: string[];
  relevanceScore: number;
  readingDepth: string;
  contextualInsight: string;
  connections: string[];
  cost?: Cost; // Add cost property
}

class ContentProcessorService {
  private openAIService: OpenAIService;

  constructor() {
    this.openAIService = new OpenAIService();
  }

  async processPage(request: ProcessPageRequest): Promise<ProcessedContent> {
    const user = await userService.getAccountInfo();
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Create system prompt
      const systemPrompt = `You are an AI assistant helping to analyze web content in the context of a user's learning journey.
Current Direction: "${request.direction}"
Page Title: "${request.pageTitle}"
URL: ${request.currentUrl}

Journey Context:
- Position: Page ${request.journeyContext.position} of ${request.journeyContext.totalPages}
- Theme: ${request.journeyContext.theme}
- Progress: ${request.journeyContext.progress.description} (${request.journeyContext.progress.percentage}% complete)

Previous pages in journey:
${request.previousEntries.map(entry => {
  const insights = entry.context.insights ? `
    Patterns: ${entry.context.insights.patterns.join(', ')}
    Learnings: ${entry.context.insights.learnings.join(', ')}
    Recommendations: ${entry.context.insights.recommendations.join(', ')}` : '';
  return `- ${entry.title}
    Relevance: ${entry.context.relationToDirection}
    ${insights}`;
}).join('\n')}

Your task is to analyze the content and return a JSON response with:
1. A concise summary
2. 3-5 key points
3. Pros and cons if applicable
4. Important statistics or data points
5. Step-by-step guide if the content contains instructions
6. Relevance score (0-1) to the direction
7. Reading depth classification (Quick Scan/Detailed Read/Deep Dive)
8. Contextual insight explaining how this fits the direction
9. Connections to previous pages
10. Patterns identified across the journey
11. Key learnings from this page
12. Recommendations based on the content
13. Related topics for further exploration

JSON Response Format:
{
  "summary": "string",
  "highlights": ["string"],
  "keyPoints": ["string"],
  "pros": ["string"],
  "cons": ["string"],
  "statistics": ["string"],
  "steps": ["string"],
  "relevanceScore": "number",
  "readingDepth": "string",
  "contextualInsight": "string",
  "connections": ["string"],
  "patterns": ["string"],
  "learnings": ["string"],
  "recommendations": ["string"],
  "relatedTopics": ["string"]
}
`;

      // Process with OpenAI
      const { completion, cost } = await this.openAIService.getChatCompletionWithRetry([
        { role: "system", content: systemPrompt },
        { role: "user", content: request.content.substring(0, 3000) } // Limit content length
      ], undefined, 3, { forceJson: true });

      // Parse and validate the response
      const processedContent = this.validateAndNormalizeResponse(JSON.parse(completion));
      
      // Add cost information to the processed content
      processedContent.cost = cost;
      
      // Log usage for analytics
      console.log("Content processing cost:", cost);

      return processedContent;
    } catch (error) {
      console.error("Error processing content:", error);
      throw error;
    }
  }

  private validateAndNormalizeResponse(data: any): ProcessedContent {
    // Default response structure
    const processed: ProcessedContent = {
      summary: "",
      highlights: [],
      keyPoints: [],
      pros: [],
      cons: [],
      statistics: [],
      steps: [],
      relevanceScore: 0,
      readingDepth: "Quick Scan",
      contextualInsight: "",
      connections: []
    };

    // Merge the response with our defaults, ensuring type safety
    return {
      ...processed,
      ...data,
      // Ensure numeric values are properly typed
      relevanceScore: Number(data.relevanceScore) || 0,
      // Ensure arrays are properly typed
      highlights: Array.isArray(data.highlights) ? data.highlights : [],
      keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
      pros: Array.isArray(data.pros) ? data.pros : [],
      cons: Array.isArray(data.cons) ? data.cons : [],
      statistics: Array.isArray(data.statistics) ? data.statistics : [],
      steps: Array.isArray(data.steps) ? data.steps : [],
      connections: Array.isArray(data.connections) ? data.connections : [],
      patterns: Array.isArray(data.patterns) ? data.patterns : [],
      learnings: Array.isArray(data.learnings) ? data.learnings : [],
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
      relatedTopics: Array.isArray(data.relatedTopics) ? data.relatedTopics : []
      // Cost will be added separately after this method is called
    };
  }
}

export const contentProcessorService = new ContentProcessorService(); 