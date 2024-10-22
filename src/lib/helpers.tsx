export const getImage = (image: string, ext?: string): string =>
    chrome.runtime?.getURL(`assets/images/${image}.${ext || 'svg'}`);
  