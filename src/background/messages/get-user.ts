import { userService } from '@/src/background/services';
import type { PlasmoMessaging } from '@plasmohq/messaging';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const user = await userService.getAccountInfo();
    res.send({ user });
  } catch (error) {
    console.error(error);
    res.send({ status: false });
  }
};

export default handler;
