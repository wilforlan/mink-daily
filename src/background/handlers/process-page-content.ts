import type { PlasmoMessaging } from "@plasmohq/messaging"
import { contentProcessorService } from "../services/content-processor.service"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const result = await contentProcessorService.processPage(req.body)
    res.send(result)
  } catch (error) {
    console.error("Error in process-page-content handler:", error)
    res.send({
      error: "Failed to process page content",
      details: error.message
    })
  }
}

export default handler 