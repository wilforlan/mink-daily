import type { PlasmoMessaging } from "@plasmohq/messaging"
import { journeyService } from "../services"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      throw new Error("URL is required");
    }
    
    // Get journey jobs for the URL
    const journeyJobs = await journeyService.getJourneyJobsByUrl(url);
    
    if (journeyJobs && journeyJobs.length > 0) {
      // Sort by timestamp (newest first)
      journeyJobs.sort((a, b) => b.timestamp - a.timestamp);
      
      // Get the latest completed job
      const latestCompletedJob = journeyJobs.find(job => job.status === "completed");
      
      if (latestCompletedJob) {
        // Convert to journey entry format for the UI
        const journeyEntry = journeyService.convertToJourneyEntry(latestCompletedJob);
        res.send(journeyEntry);
      } else {
        // If no completed job, check if there's a processing job
        const processingJob = journeyJobs.find(job => job.status === "processing");
        
        if (processingJob) {
          // Return a placeholder entry
          res.send({
            title: processingJob.title,
            url: processingJob.url,
            content: "Processing page content...",
            highlights: ["Analyzing content...", "Generating insights..."],
            badges: ["Processing"],
            timestamp: processingJob.timestamp,
            summary: {
              keyPoints: [],
              pros: [],
              cons: [],
              statistics: []
            },
            relevanceScore: 0,
            context: {
              relationToDirection: "Analyzing relevance to your direction..."
            }
          });
        } else {
          // If no processing job, check if there's a failed job
          const failedJob = journeyJobs.find(job => job.status === "failed");
          
          if (failedJob) {
            // Return an error entry
            res.send({
              title: failedJob.title,
              url: failedJob.url,
              content: "Failed to process page content.",
              highlights: ["Error processing content"],
              badges: ["Error"],
              timestamp: failedJob.timestamp,
              summary: {
                keyPoints: [],
                pros: [],
                cons: [],
                statistics: []
              },
              relevanceScore: 0,
              context: {
                relationToDirection: "Could not analyze relevance",
                error: failedJob.error
              }
            });
          } else {
            // No jobs with a definitive status
            throw new Error("No journey entry found for this URL");
          }
        }
      }
    } else {
      throw new Error("No journey entry found for this URL");
    }
  } catch (error) {
    console.error("Error in get-journey-entry handler:", error);
    res.send({
      error: "Failed to retrieve journey entry",
      details: error.message
    });
  }
}

export default handler; 