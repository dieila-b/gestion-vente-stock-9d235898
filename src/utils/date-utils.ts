
import { format } from "date-fns";

/**
 * Safely formats a date string to a readable format
 * Returns a fallback value if the date is invalid
 * 
 * @param dateString The date string to format
 * @param formatString Format pattern (default: "dd/MM/yyyy")
 * @param fallback Value to return if date is invalid (default: "-")
 * @returns Formatted date string or fallback value
 */
export const safeFormatDate = (
  dateString: string | undefined | null, 
  formatString: string = "dd/MM/yyyy", 
  fallback: string = "-"
): string => {
  if (!dateString) return fallback;
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date encountered: ${dateString}`);
      return fallback;
    }
    
    return format(date, formatString);
  } catch (error) {
    console.error("Error formatting date:", error, dateString);
    return fallback;
  }
};

/**
 * Safely formats the current date and time
 * 
 * @param formatString Format pattern (default: "dd/MM/yyyy HH:mm")
 * @param fallback Value to return if an error occurs (default: "-")
 * @returns Formatted current date/time or fallback value
 */
export const getCurrentFormattedDate = (
  formatString: string = "dd/MM/yyyy HH:mm",
  fallback: string = "-"
): string => {
  try {
    return format(new Date(), formatString);
  } catch (error) {
    console.error("Error formatting current date:", error);
    return fallback;
  }
};
