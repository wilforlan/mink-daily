import { userService } from '@/src/background/services';
import type { PlasmoMessaging } from '@plasmohq/messaging';
import { SegmentAnalyticsEvents } from '../commons/analytics';
import { analyticsTrack } from '../commons/analytics';
import { scope as sentryScope } from '@/src/lib/sentry';

sentryScope.setTag("service", "messages/update-account-settings.ts");

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { body } = req;
    console.log('update-account-settings.ts: body:', body);
    const previousSettings = await userService.getSettings();
    const settings = await userService.updateSettings(body);
    
    await analyticsTrack(SegmentAnalyticsEvents.SETTINGS_UPDATED, {
      currentSettings: settings,
      previousSettings,
    });
    
    res.send({ status: true, settings });
  } catch (error) {
    sentryScope.captureException(error);
    console.error(error);
    res.send({ status: false, info: null, error: error.message || error });
  }
};

export default handler;
