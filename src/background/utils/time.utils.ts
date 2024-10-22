import moment from 'moment';
import type { IGetTime } from '~interfaces';
import { defaultTime } from '~misc';

export function getUnixTimestamp() {
  return moment().unix();
}

export function getDurationTill(startingTime: number, ts: number): number {
  return (ts - startingTime) / 1000;
}

export const getDurationTillNow = (startTime: number): number => getDurationTill(startTime, Date.now());

const formatter = (num: number): string => `${num < 10 ? '0' : ''}${num}`;
export const getFormattedTime = (params?: IGetTime): string => {
  const { showUnit, showHours = true, humanize, startTime } = params || {};
  if (!startTime) return defaultTime;
  let time = getDurationTillNow(startTime);
  let unit = 'mins';
  let hour = 0;
  if (showHours) {
    hour = Math.trunc(time / 3600);
    time -= hour * 3600;
  }
  const min = Math.trunc(time / 60);
  const sec = Math.round(time - min * 60);
  const hourText = hour ? `${formatter(hour)}:` : '';
  if (humanize) return `${hour ? `${hour}hr` : ''}${min}min`;
  if (hourText.length) unit = 'hours';
  return `${hourText}${formatter(min)}:${formatter(sec)} ${showUnit ? unit : ''}`;
};
