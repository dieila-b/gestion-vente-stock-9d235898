
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Safely format a date string to a readable format
 * @param dateString Date string or ISO date to format
 * @param formatString Optional format string, defaults to dd/MM/yyyy
 * @returns Formatted date string or placeholder if invalid
 */
export const safeFormatDate = (dateString?: string | Date | null, formatString = "dd/MM/yyyy"): string => {
  if (!dateString) return "-";
  
  try {
    // Try to parse the date
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    
    // Check if the date is valid
    if (!isValid(date)) {
      return "-";
    }
    
    return format(date, formatString, { locale: fr });
  } catch (error) {
    console.error("Error formatting date:", error, { dateString });
    return "-";
  }
};
