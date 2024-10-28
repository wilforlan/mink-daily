import { minkService, userService } from '@/src/background/services';
import type { PlasmoMessaging } from '@plasmohq/messaging';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const data = await minkService.getLatestSummaryAndInsight({ date: req.body.date });
    res.send({ status: true, data });
  } catch (error) {
    console.error(error);
    res.send({ status: false, info: null, error: error.message || error });
  }
};

export default handler;
