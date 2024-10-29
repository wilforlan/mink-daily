// @ts-ignore
import type { PlasmoGetStyle } from 'plasmo';

export const closeWindow = (): void => {
  window.close();
};

export const getImage = (image: string, ext?: string): string =>
  chrome.runtime?.getURL(`assets/images/${image}.${ext || 'svg'}`);

export const addFonts = (documentElem: Document, node?: Node): void => {
  if (documentElem) {
    const styleNode = documentElem.createElement('style');
    styleNode.textContent =
      `@font-face { font-family: DMSans; src: url('${chrome.runtime?.getURL('assets/fonts/DMSans-Regular.ttf')}'); }` +
      `@font-face { font-family: PoppinsMedium; src: url('${chrome.runtime?.getURL(
        'assets/fonts/Poppins-Medium.otf',
      )}'); }` +
      `@font-face { font-family: PoppinsRegular; src: url('${chrome.runtime?.getURL(
        'assets/fonts/Poppins-Regular.otf',
      )}'); }` +
      `@font-face { font-family: Roboto; src: url('${chrome.runtime?.getURL('assets/fonts/Roboto-Regular.ttf')}'); }` +
      `@font-face { font-family: Inter; src: url('${chrome.runtime?.getURL('assets/fonts/Inter-Regular.ttf')}'); }`;

    if (node) {
      node.appendChild(styleNode);
      return;
    }

    (documentElem.head || documentElem).appendChild(styleNode);
  }
};

export const getXpathSingleNode = (regex: string, doc?: Document) => {
  const docmt = doc || document;
  return docmt.evaluate(`.${regex}`, docmt.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
};

export const getElementByXpath = (regex: string, doc?: Document) => {
  const docmt = doc || document;
  return docmt.evaluate(`${regex}`, docmt.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
};

export const sleepFor = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

