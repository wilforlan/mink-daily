const extRuntime = (globalThis.browser?.runtime || globalThis.chrome?.runtime) as typeof chrome.runtime;
const extTabs = (globalThis.browser?.tabs || globalThis.chrome?.tabs) as typeof chrome.tabs;
import type { UnknownType } from '@/interfaces';
import { type sendToBackgroundViaRelay } from '@plasmohq/messaging';

type FirstArgumentType<T> = T extends (arg1: infer U, ...args: UnknownType[]) => UnknownType ? U : never;
type PlasmoMessageRequest = FirstArgumentType<typeof sendToBackgroundViaRelay>;

export const getExtRuntime = () => {
  if (!extRuntime) {
    throw new Error('Extension runtime is not available');
  }
  return extRuntime;
};

export const getExtTabs = () => {
  if (!extTabs) throw new Error('Extension tabs API is not available');
  return extTabs;
};

export function versionStringToNumber(versionString: string) {
  const version = versionString.split('.').reduce((acc, cur, index) => {
    return acc + parseInt(cur) * Math.pow(100, 2 - index);
  }, 0);
  return version;
}

export function getChromeVersion() {
  const raw = navigator.userAgent?.match(/Chrom(e|ium)\/([0-9]+)\./);
  if (!raw) return null;
  return parseInt(raw[2], 10);
}

export const sendToBackground = (extensionId: string, req: PlasmoMessageRequest): Promise<UnknownType> => {
  if (!extensionId) return Promise.reject('no extension id found');
  return new Promise((resolvePromise, reject) => {
    chrome.runtime.sendMessage(extensionId, req, (res) => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else resolvePromise(res);
    });
  });
};

