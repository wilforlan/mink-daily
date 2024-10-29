import { minkService, userService } from '@/src/background/services';
import type { PlasmoMessaging } from '@plasmohq/messaging';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const notifications = await minkService.getNotifications();
    res.send({ status: true, notifications });
  } catch (error) {
    console.error(error);
    res.send({ status: false });
  }
};

export default handler;
