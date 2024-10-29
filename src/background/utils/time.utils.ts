import moment from 'moment';

export function getUnixTimestamp() {
  return moment().unix();
}

export function getDurationTill(startingTime: number, ts: number): number {
  return (ts - startingTime) / 1000;
}

export const getDurationTillNow = (startTime: number): number => getDurationTill(startTime, Date.now());

