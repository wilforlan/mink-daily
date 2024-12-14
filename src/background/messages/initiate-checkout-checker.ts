import { userService, billingService } from '@/src/background/services';
import type { PlasmoMessaging } from '@plasmohq/messaging';
import { scope as sentryScope, client as sentry } from '@/src/lib/sentry';

sentryScope.setTag("service", "messages/initiate-checkout-checker.ts");

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { body } = req;
    const info = await billingService.initiateCheckoutChecker(body);
    res.send({ status: true, info });
  } catch (error) {
    console.error(error);
    sentryScope.captureException(error);
    res.send({ status: false, info: null, error: error.message || error });
  }
};

export default handler;
