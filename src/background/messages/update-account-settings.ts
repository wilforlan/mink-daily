import { userService } from '@/src/background/services';
import type { PlasmoMessaging } from '@plasmohq/messaging';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { body } = req;
    console.log('update-account-settings.ts: body:', body);
    const settings = await userService.updateSettings(body);
    res.send({ status: true, settings });
  } catch (error) {
    console.error(error);
    res.send({ status: false, info: null, error: error.message || error });
  }
};

export default handler;
