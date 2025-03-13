import type { PlasmoMessaging } from "@plasmohq/messaging"
import { journeyService } from "../services"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { limit = 10 } = req.body;
    
    // Get the latest journey jobs
    const journeyJobs = await journeyService.getLatestJourneyJobs(limit);
    
    if (journeyJobs && journeyJobs.length > 0) {
      // Filter for completed jobs
      const completedJobs = journeyJobs.filter(job => job.status === "completed");
      
      // Convert to journey entry format for the UI
      const journeyEntries = completedJobs.map(job => journeyService.convertToJourneyEntry(job));
      
      res.send(journeyEntries);
    } else {
      res.send([]);
    }
  } catch (error) {
    console.error("Error in get-latest-journey-entries handler:", error);
    res.send({
      error: "Failed to retrieve journey entries",
      details: error.message
    });
  }
}

export default handler; 