// Date utility functions for consistent timezone-safe date handling

/**
 * Parse a date string (YYYY-MM-DD) into a Date object in local timezone
 * This avoids timezone issues by parsing the date components directly
 * instead of relying on Date constructor's ISO string parsing
 *
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date} - Date object in local timezone
 */
export const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();

  // Split the date string into components
  const [year, month, day] = dateStr.split("-").map(Number);

  // Create date using local timezone (month is 0-indexed)
  return new Date(year, month - 1, day);
};

/**
 * Format a date string for consistent display
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {string} formatStr - Format string for date-fns format function
 * @returns {string} - Formatted date string
 */
export const formatLocalDate = (dateStr, formatStr) => {
  const { format } = require("date-fns");
  const date = parseLocalDate(dateStr);
  return format(date, formatStr);
};

/**
 * Get the current date in YYYY-MM-DD format
 * @returns {string} - Current date string
 */
export const getCurrentDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Check if a date string is valid
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} - True if valid date string
 */
export const isValidDateString = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return false;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;

  const date = parseLocalDate(dateStr);
  return !isNaN(date.getTime());
};
