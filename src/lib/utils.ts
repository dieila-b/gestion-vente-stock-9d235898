
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { isSelectQueryError } from "@/utils/supabase-helpers";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr: string = "dd/MM/yyyy"): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, formatStr, { locale: fr });
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(date);
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Safely transform SelectQueryError objects into default values
 */
export function safelyTransform<T>(value: any, defaultValue: T): T {
  if (isSelectQueryError(value) || !value) {
    return defaultValue;
  }
  return value as T;
}

/**
 * Safe accessor for object properties
 */
export function safeValue<T>(obj: any, key: string, defaultValue: T): T {
  if (!obj || isSelectQueryError(obj) || obj[key] === undefined || obj[key] === null) {
    return defaultValue;
  }
  return obj[key] as T;
}

/**
 * Cast a union type to a specific type with a default value
 */
export function castWithDefault<T>(value: any, defaultValue: T): T {
  if (value === null || value === undefined || isSelectQueryError(value)) {
    return defaultValue;
  }
  return value as T;
}

/**
 * Safe array filter for arrays that might be SelectQueryError objects
 */
export function safelyFilterArray<T>(array: any, predicate: (item: T) => boolean): T[] {
  if (!array || isSelectQueryError(array) || !Array.isArray(array)) {
    return [];
  }
  
  return array.filter(predicate);
}
