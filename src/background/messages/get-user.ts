import { userService } from '@/src/background/services';
import type { PlasmoMessaging } from '@plasmohq/messaging';
import { scope as sentryScope } from '@/src/lib/sentry';

sentryScope.setTag("service", "messages/get-user.ts");

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const user = await userService.getAccountInfo();
    res.send({ user });
  } catch (error) {
    sentryScope.captureException(error);
    console.error(error);
    res.send({ status: false });
  }
};

export default handler;
