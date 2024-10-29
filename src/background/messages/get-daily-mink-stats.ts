import { minkService, userService } from '@/src/background/services';
import type { PlasmoMessaging } from '@plasmohq/messaging';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const stats = await minkService.getDailyMinkStats(req.body.url);
    res.send({ status: true, stats });
  } catch (error) {
    console.error(error);
    res.send({ status: false });
  }
};

export default handler;
