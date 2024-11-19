import { minkService, userService } from '@/src/background/services';
import type { PlasmoMessaging } from '@plasmohq/messaging';
import { scope as sentryScope } from '@/src/lib/sentry';

sentryScope.setTag("service", "messages/get-latest-summary-and-insight.ts");

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const result = await minkService.getLatestSummaryAndInsight({ date: req.body.date });
    const hasHadAtleastOneSummary = await minkService.hasAtLeastOneSummary();

    const data = {
      ...result,
      hasHadAtleastOneSummary
    };

    res.send({ status: true, data });
  } catch (error) {
    sentryScope.captureException(error);
    console.error(error);
    res.send({ status: false, info: null, error: error.message || error });
  }
};

export default handler;
