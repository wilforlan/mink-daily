import { userService } from '@/src/background/services';
import type { PlasmoMessaging } from '@plasmohq/messaging';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    await userService.logoutUser();
    res.send({ status: true });
  } catch (error) {
    console.error(error);
    res.send({ status: false });
  }
};

export default handler;
