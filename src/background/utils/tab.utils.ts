import { captureError } from '@/src/background/commons/sentry-log';
import { getExtRuntime, getExtTabs } from './runtime.utils';
import type { PlasmoMessaging } from '@plasmohq/messaging';

export function createTab(url: string): Promise<chrome.tabs.Tab> {
  const promise = new Promise<chrome.tabs.Tab>((resolve, reject) => {
    const tabs = getExtTabs();
    try {
      tabs.create({ url }, resolve);
    } catch (e) {
      captureError(e as Error);
      reject(e);
    }
  });
  return promise;
}

export function doesTabExist(tabId: number) {
  return new Promise((resolve) => {
    getExtTabs().get(tabId, () => {
      resolve(!getExtRuntime().lastError);
    });
  });
}

export async function focusTab(tabId: number): Promise<boolean> {
  const tabs = getExtTabs();
  const tabExists = await doesTabExist(tabId);
  if (!tabExists) {
    return false;
  }
  tabs.update(tabId, { active: true });
  return !chrome.runtime.lastError;
}

export function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  return new Promise((resolve) => {
    const tabs = getExtTabs();
    tabs.query(
      {
        active: true,
        currentWindow: true,
        status: 'complete',
      },
      (tabList: Array<chrome.tabs.Tab>) => {
        if (tabList.length && tabList[0].id) {
          resolve(tabList[0]);
        } else {
          resolve(undefined);
        }
      },
    );
  });
}

export function removeTab(tabId: number) {
  return getExtTabs().remove(tabId);
}

export const getSenderTabId = async (req: PlasmoMessaging.Request): Promise<number | undefined> => {
  return req.sender?.tab?.id || (await getActiveTab())?.id;
};

export const sendToTab = async (tabId: number, action: any, data?: any): Promise<void> => {
  const isTabExists = await doesTabExist(tabId);
  if (isTabExists && chrome.tabs?.sendMessage && tabId > -1) {
    // TODO: to check on which message we are frequently getting this error
    console.log('sending message to tab: ', action);
    chrome.tabs.sendMessage(tabId, { action, data });
  }
};

export const sendToAllTabs = (action: any, data?: any): void => {
  const { activeTab, restrictToAllowedOrigins } = data || {};
  if (chrome.tabs?.query) {
    chrome.tabs.query({}, (tabs) => {
      for (let i = 0; i < tabs.length; i += 1) {
        const tabId = tabs[i].id;
        const tabUrl = tabs[i].url;
        if (tabId && tabUrl) {
          sendToTab(tabId, action, { ...data, isActiveTab: activeTab === tabId });
        }
      }
    });
  }
};

export const getTabById = async (tabId?: number): Promise<null | chrome.tabs.Tab> => {
  if (!tabId) return Promise.resolve(null);

  const isTabExists = await doesTabExist(tabId);
  if (!isTabExists) return Promise.resolve(null);

  return new Promise((resolve) => {
    getExtTabs().get(tabId).then(resolve);
  });
};
