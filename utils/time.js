import { parseISO, format } from "date-fns";

/**
 * Parse a UTC ISO string from the API into a local Date object for display.
 * date-fns parseISO handles Z-suffixed strings correctly, converting to local time.
 *
 * Use this everywhere an event's start_time or end_time is read from API data.
 *
 * @param {string} isoStr - UTC ISO 8601 string, e.g. "2026-03-15T14:00:00.000Z"
 * @returns {Date}
 */
export const parseEventTime = (isoStr) => parseISO(isoStr);

/**
 * Convert a datetime-local input string (timezone-naive, local time)
 * to a UTC ISO string suitable for sending to the API.
 *
 * Use this in every form handleSubmit before putting times in the payload.
 *
 * @param {string} localStr - datetime-local value, e.g. "2026-03-15T09:00"
 * @returns {string|null} UTC ISO string, e.g. "2026-03-15T14:00:00.000Z"
 */
export const localInputToUTC = (localStr) =>
  localStr ? new Date(localStr).toISOString() : null;

/**
 * Convert a UTC ISO string from the API back to a datetime-local input value
 * so edit forms are pre-filled with the user's local time.
 *
 * Use this when initialising form state from an existing event.
 *
 * @param {string} isoStr - UTC ISO 8601 string, e.g. "2026-03-15T14:00:00.000Z"
 * @returns {string} datetime-local value in local time, e.g. "2026-03-15T09:00"
 */
export const utcToLocalInput = (isoStr) =>
  isoStr ? format(parseISO(isoStr), "yyyy-MM-dd'T'HH:mm") : "";
