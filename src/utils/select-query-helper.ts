
import { isSelectQueryError } from "@/utils/supabase-helpers";

/**
 * Helper function to safely extract properties from potentially SelectQueryError objects
 * @param obj The object that might be a SelectQueryError
 * @param defaultValue Default value to return if obj is a SelectQueryError
 * @returns The original object or the default value
 */
export function safelyUnwrapObject<T>(obj: any, defaultValue: T): T {
  if (!obj || isSelectQueryError(obj)) {
    return defaultValue;
  }
  return obj as T;
}

/**
 * Helper function to safely get a property from an object that might be a SelectQueryError
 * @param obj The object that might be a SelectQueryError
 * @param propName The property name to access
 * @param defaultValue Default value to return if obj is a SelectQueryError or property doesn't exist
 * @returns The property value or default value
 */
export function safelyGetProperty<T>(obj: any, propName: string, defaultValue: T): T {
  if (!obj || isSelectQueryError(obj) || obj[propName] === undefined) {
    return defaultValue;
  }
  return obj[propName] as T;
}

/**
 * Helper function to handle supplier data that might be a SelectQueryError
 * @param supplier The supplier object that might be a SelectQueryError
 * @returns A safe supplier object with default values if needed
 */
export function safeSupplier(supplier: any) {
  const defaultSupplier = {
    id: "",
    name: "Unknown Supplier",
    phone: "",
    email: ""
  };

  return isSelectQueryError(supplier)
    ? defaultSupplier
    : {
        id: safelyGetProperty(supplier, 'id', defaultSupplier.id),
        name: safelyGetProperty(supplier, 'name', defaultSupplier.name),
        phone: safelyGetProperty(supplier, 'phone', defaultSupplier.phone),
        email: safelyGetProperty(supplier, 'email', defaultSupplier.email)
      };
}

/**
 * Helper function to handle client data that might be a SelectQueryError
 * @param client The client object that might be a SelectQueryError
 * @returns A safe client object with default values if needed
 */
export function safeClient(client: any) {
  const defaultClient = {
    id: "",
    company_name: "Unknown Company",
    contact_name: "Unknown Contact",
    status: "particulier" as "particulier" | "entreprise",
    email: "",
    phone: ""
  };

  return isSelectQueryError(client) 
    ? defaultClient
    : {
        id: safelyGetProperty(client, 'id', defaultClient.id),
        company_name: safelyGetProperty(client, 'company_name', defaultClient.company_name),
        contact_name: safelyGetProperty(client, 'contact_name', defaultClient.contact_name),
        status: safelyGetProperty(client, 'status', defaultClient.status),
        email: safelyGetProperty(client, 'email', defaultClient.email),
        phone: safelyGetProperty(client, 'phone', defaultClient.phone)
      };
}

/**
 * Helper function to safely cast an object with a type assertion
 * @param value The value to cast
 * @param defaultValue The default value if casting fails
 * @returns The cast value or default value
 */
export function safeCast<T>(value: any, defaultValue: T): T {
  try {
    if (value === null || value === undefined || isSelectQueryError(value)) {
      return defaultValue;
    }
    return value as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Helper function to safely handle arrays that might be a SelectQueryError
 * @param arr The array that might be a SelectQueryError
 * @param defaultValue Default array to return if arr is a SelectQueryError
 * @returns The original array or default array
 */
export function safeArray<T>(arr: any, defaultValue: T[] = []): T[] {
  if (!arr || isSelectQueryError(arr) || !Array.isArray(arr)) {
    return defaultValue;
  }
  return arr as T[];
}
