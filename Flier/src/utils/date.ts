const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function toISODateString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseISODateString(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

export function compareISODateStrings(left: string, right: string) {
  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
}

export function getDateRange(start: string, end: string) {
  const values: string[] = [];
  let current = parseISODateString(start);
  const endDate = parseISODateString(end);

  while (current.getTime() <= endDate.getTime()) {
    values.push(toISODateString(current));
    current = addDays(current, 1);
  }

  return values;
}

export function getDayDifference(start: string, end: string) {
  return Math.max(
    Math.round(
      (parseISODateString(end).getTime() - parseISODateString(start).getTime()) /
        DAY_IN_MS,
    ),
    0,
  );
}

export function formatDateString(
  value: string,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat('en-US', options).format(
    parseISODateString(value),
  );
}
