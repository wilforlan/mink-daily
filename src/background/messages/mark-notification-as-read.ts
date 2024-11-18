import { userService } from '@/src/background/services';
import type { PlasmoMessaging } from '@plasmohq/messaging';
import { scope as sentryScope } from '@/src/lib/sentry';

sentryScope.setTag("service", "messages/mark-notification-as-read.ts");

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    await userService.logoutUser();
    res.send({ status: true });
  } catch (error) {
    sentryScope.captureException(error);
    console.error(error);
    res.send({ status: false });
  }
};

export default handler;
