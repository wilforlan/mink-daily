export * from './local-storage';
export * from './priority-queue';
export * from './app';
export * from './growth-book';

declare global {
  interface Window {
    proxyPeerConnection?: RTCPeerConnection;
  }
}
