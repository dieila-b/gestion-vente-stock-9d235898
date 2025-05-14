
import { format, isValid, parseISO } from "date-fns";

/**
 * Safely format a date string, handling invalid or undefined dates
 * by returning a placeholder value instead of throwing errors.
 * 
 * @param dateString Date string, Date object, or null/undefined
 * @param formatString Optional format string, defaults to dd/MM/yyyy
 * @returns Formatted date string or placeholder if invalid
 */
export const safeFormatDate = (dateString?: string | Date | null, formatString = "dd/MM/yyyy"): string => {
  if (!dateString) return "-";
  
  try {
    // Handle when dateString is already a Date object
    if (dateString instanceof Date) {
      return isValid(dateString) ? format(dateString, formatString) : "-";
    }
    
    // Parse the string to Date object
    const date = parseISO(dateString);
    return isValid(date) ? format(date, formatString) : "-";
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
};
