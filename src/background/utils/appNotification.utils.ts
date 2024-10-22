import { getImage } from "@/src/misc";

const getNotificationId = (): string => `_${Math.random().toString(36).substr(2, 9)}`;

export const onNotificationSent =
  (callback?: any) =>
  (notificationId: string): void => {
    const error = chrome.runtime.lastError;
    if (error?.message) console.log(`----- error while trying to send notification: ${error.message}`);
    callback?.(notificationId);
  };

export const showChromeNotification = ({ title, message }: any, callback?: any): void => {
  const iconUrl = getImage('icon-128', 'png');
  const notificationOptions: any = { title, message, iconUrl };
  chrome.notifications.create(
    getNotificationId(),
    { ...notificationOptions, type: 'basic' },
    onNotificationSent(callback),
  );
};
