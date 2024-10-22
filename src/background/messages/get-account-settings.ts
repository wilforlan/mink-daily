import { userService } from '@/src/background/services';
import type { PlasmoMessaging } from '@plasmohq/messaging';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const settings = await userService.getSettings();
    res.send({ status: true, settings });
  } catch (error) {
    console.error(error);
    res.send({ status: false, info: null, error: error.message || error });
  }
};

export default handler;
