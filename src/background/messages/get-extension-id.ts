import type { PlasmoMessaging } from '@plasmohq/messaging';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  res.send({ status: true, data: { extensionId: chrome.runtime.id } });
};

export default handler;
