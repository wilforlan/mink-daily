import { userService } from "."
import OpenAIService from "./openai.service"

interface ProcessPageRequest {
  content: string;
  direction: string;
  url: string;
  title: string;
  previousEntries: any[];
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
Page Title: "${request.title}"
URL: ${request.url}

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

Previous pages in journey:
${request.previousEntries.map(entry => `- ${entry.title}`).join('\n')}

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
  "connections": ["string"]
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
      connections: Array.isArray(data.connections) ? data.connections : []
      // Cost will be added separately after this method is called
    };
  }
}

export const contentProcessorService = new ContentProcessorService(); 