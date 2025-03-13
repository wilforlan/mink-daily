import type { PlasmoMessaging } from "@plasmohq/messaging"
import { journeyService } from "../services"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { direction } = req.body;
    
    if (!direction) {
      throw new Error("Direction is required");
    }
    
    // Get journey jobs for the direction
    const journeyJobs = await journeyService.getJourneyJobsByDirection(direction);
    
    if (journeyJobs && journeyJobs.length > 0) {
      // Filter for completed jobs
      const completedJobs = journeyJobs.filter(job => job.status === "completed");
      
      // Sort by timestamp (newest first)
      completedJobs.sort((a, b) => b.timestamp - a.timestamp);
      
      // Convert to journey entry format for the UI
      const journeyEntries = completedJobs.map(job => journeyService.convertToJourneyEntry(job));
      
      res.send(journeyEntries);
    } else {
      res.send([]);
    }
  } catch (error) {
    console.error("Error in get-journey-entries-by-direction handler:", error);
    res.send({
      error: "Failed to retrieve journey entries",
      details: error.message
    });
  }
}

export default handler; 