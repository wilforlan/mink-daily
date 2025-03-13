import type { PlasmoMessaging } from "@plasmohq/messaging"
import { journeyService } from "../services"
import { scope as sentryScope } from '@/src/lib/sentry'

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    // Get the journey map for the current day
    const journeyMap = await journeyService.getDailyJourneyMap();
    
    res.send({
      status: true,
      journeyMap
    });
  } catch (error) {
    sentryScope.captureException(error);
    console.error("Error retrieving journey map:", error);
    res.send({
      status: false,
      error: error.message || error
    });
  }
}

export default handler; 