import { databaseService, minkService, userService } from '@/src/background/services';
import type { PlasmoMessaging } from '@plasmohq/messaging';
import { SegmentAnalyticsEvents } from '../commons/analytics';
import { analyticsTrack } from '../commons/analytics';
import { scope as sentryScope } from '@/src/lib/sentry';

sentryScope.setTag("service", "messages/track-webpage-session.ts");

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {

    const { body } = req;
    await minkService.saveWebpageSession(body);
    await analyticsTrack(SegmentAnalyticsEvents.WEB_PAGE_SESSION_SAVED, {
      title: body.title,
      url: body.url,
      origin: body.origin,
    });
    res.send({ status: true });
  } catch (error) {
    sentryScope.captureException(error);
    console.error(error);
    res.send({ status: false, info: null, error: error.message || error });
  }
};

export default handler;
