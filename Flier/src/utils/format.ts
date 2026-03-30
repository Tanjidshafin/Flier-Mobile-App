import { formatDateString, getDayDifference } from './date';

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(amount);
}

export function formatShortDate(date: string) {
  return formatDateString(date, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export function formatLongDate(date: string) {
  return formatDateString(date, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    weekday: 'short',
  });
}

export function getNightCount(checkIn: string, checkOut: string) {
  return Math.max(getDayDifference(checkIn, checkOut), 1);
}
