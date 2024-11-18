import { minkService, userService } from '@/src/background/services';
import type { PlasmoMessaging } from '@plasmohq/messaging';
import { scope as sentryScope } from '@/src/lib/sentry';

sentryScope.setTag("service", "messages/get-notifications.ts");

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const notifications = await minkService.getNotifications();
    res.send({ status: true, notifications });
  } catch (error) {
    sentryScope.captureException(error);
    console.error(error);
    res.send({ status: false });
  }
};

export default handler;
