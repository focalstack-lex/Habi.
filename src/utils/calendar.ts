/**
 * Calendar helpers shared by drops and map events: a Google Calendar deep link,
 * an RFC 5545 .ics document, and a browser download for it.
 */

export interface CalendarEventInput {
  title: string;
  details: string;
  location: string;
  start: Date;
  end: Date;
}

export interface IcsEventInput extends CalendarEventInput {
  uid: string;
}

/** `YYYYMMDDTHHMMSSZ` in UTC, the stamp format both Google Calendar and .ics use. */
export function toCalendarStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** `YYYY-MM-DD` in the browser's local time zone (not UTC), for grouping by day. */
export function localDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function googleCalendarUrl({ title, details, location, start, end }: CalendarEventInput): string {
  const query = [
    'action=TEMPLATE',
    `text=${encodeURIComponent(title)}`,
    `dates=${toCalendarStamp(start)}/${toCalendarStamp(end)}`,
    `details=${encodeURIComponent(details)}`,
    `location=${encodeURIComponent(location)}`,
  ].join('&');
  return `https://calendar.google.com/calendar/render?${query}`;
}

/** Escapes text for an .ics property value: backslashes, semicolons, commas, newlines. */
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** RFC 5545 line folding: content lines longer than 75 octets continue on a new line after one space. */
function foldIcsLine(line: string): string {
  const MAX = 75;
  if (line.length <= MAX) return line;
  const parts: string[] = [line.slice(0, MAX)];
  let rest = line.slice(MAX);
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, MAX - 1)}`);
    rest = rest.slice(MAX - 1);
  }
  return parts.join('\r\n');
}

export function buildIcs({ uid, title, details, location, start, end }: IcsEventInput): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Habi//Davao Fashion Drops//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(uid)}`,
    `DTSTAMP:${toCalendarStamp(new Date())}`,
    `DTSTART:${toCalendarStamp(start)}`,
    `DTEND:${toCalendarStamp(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(details)}`,
    `LOCATION:${escapeIcsText(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
}

/** Turns a title into a safe `.ics` file name, e.g. "VOID ARCHIVE: Capsule" -> "void-archive-capsule.ics". */
export function icsFilename(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${slug || 'event'}.ics`;
}

export function downloadIcs(filename: string, ics: string): void {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Give the browser a moment to start the download before the object URL goes away.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
