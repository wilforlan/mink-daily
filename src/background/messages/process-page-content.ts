import type { PlasmoMessaging } from "@plasmohq/messaging"
import { journeyService } from "../services"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    // Create a journey job to process the page
    const journeyJob = await journeyService.createJourneyJob({
      content: req.body.content,
      direction: req.body.direction,
      url: req.body.url,
      title: req.body.title,
      previousEntries: req.body.previousEntries
    });

    // If the job is created successfully, convert it to a journey entry for the UI
    if (journeyJob) {
      // For immediate response, we'll return a placeholder entry
      // The actual processing happens asynchronously
      const initialEntry = {
        title: journeyJob.title,
        url: journeyJob.url,
        content: "Processing page content...",
        highlights: ["Analyzing content...", "Generating insights..."],
        badges: ["Processing"],
        timestamp: journeyJob.timestamp,
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
      };

      res.send(initialEntry);
    } else {
      throw new Error("Failed to create journey job");
    }
  } catch (error) {
    console.error("Error in process-page-content handler:", error);
    res.send({
      error: "Failed to process page content",
      details: error.message
    });
  }
}

export default handler; 