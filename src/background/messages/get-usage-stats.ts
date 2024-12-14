import { billingService } from '@/src/background/services';
import type { PlasmoMessaging } from '@plasmohq/messaging';
import { scope as sentryScope } from '@/src/lib/sentry';

sentryScope.setTag("service", "messages/get-daily-mink-stats.ts");

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const stats = await billingService.getUsage(req.body);
    res.send({ status: true, stats });
  } catch (error) {
    sentryScope.captureException(error);
    console.error(error);
    res.send({ status: false });
  }
};

export default handler;
