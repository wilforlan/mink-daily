import { configStore } from '@/src/background/commons/constants';
import { captureError } from '@/src/background/commons/sentry-log';
import type { UnknownType } from '@/src/interfaces';

const version = chrome?.runtime?.getManifest?.()?.version;

const enum Methods {
  GET = 'GET',
  POST = 'POST',
}

const Analytics = (key: string) => {
  let user: UnknownType | null = { userId: '', traits: {} };
  let anonId = '';
  let initialized = false;

  const init = async (userTraits: UnknownType): Promise<boolean> => {
    if (!initialized) {
      try {
        user = userTraits;
        initialized = true;
      } catch (error) {
        captureError(error as Error);
        return false;
      }
    }
    return true;
  };

  const randomString = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  anonId = randomString();

  const getState = (state: string): UnknownType => {
    switch (state) {
      case 'user':
        return user;
      default:
        return null;
    }
  };

  const getContext = async () => {
    return {
      ip: '',
      library: { name: 'mink-daily', version },
    };
  };

  const generateAuthKey = (): string => {
    const authKey = `${key}:`;
    const encodedKey = btoa(authKey);
    return `Basic ${encodedKey}`;
  };

  const apiCall = (method: string, url: string, data: UnknownType): Promise<Response> => {
    const headers = { 'Content-Type': 'application/json', Authorization: generateAuthKey() };
    const options = { method, headers, body: JSON.stringify(data) };
    return fetch(url, options);
  };

  const identify = async (userId: string, traits: Record<string, unknown>): Promise<void> => {
    const url = `https://api.segment.io/v1/identify`;
    const data = { userId, traits, context: await getContext(), timestamp: new Date() };
    await apiCall(Methods.POST, url, data);
    user = data;
  };

  const track = async (event: string, properties: UnknownType): Promise<void> => {
    const url = `https://api.segment.io/v1/track`;
    const anonId = randomString();
    const data = {
      ...(user ? { userId: properties.email || user.userId } : { anonymousId: anonId }),
      event,
      properties: { ...properties, version },
      context: await getContext(),
      timestamp: new Date(),
    };
    await apiCall(Methods.POST, url, data);
  };

  const page = async (category: string, name: string, properties: UnknownType): Promise<void> => {
    const url = `https://api.segment.io/v1/page`;
    const data = {
      ...(user ? { userId: user.userId } : { anonymousId: anonId }),
      category,
      name,
      properties,
      context: await getContext(),
      timestamp: new Date(),
    };
    await apiCall(Methods.POST, url, data);
  };

  const reset = () => {
    user = { userId: '', traits: {} };
    anonId = randomString();
  };

  return { getState, identify, track, page, reset, init };
};

const analytics = Analytics(configStore.getConfig('ANALYTICS_KEY'));

export { analytics };
export default Analytics;
