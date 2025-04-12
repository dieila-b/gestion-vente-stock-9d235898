
import { SelectQueryError } from "@/types/db-adapter";

/**
 * Type guard to check if an object is a SelectQueryError
 */
export function isSelectQueryError(obj: any): obj is SelectQueryError {
  return obj && typeof obj === 'object' && obj.error === true;
}

/**
 * Creates a safe default object for suppliers when we encounter SelectQueryError
 */
export function safeSupplier(supplier: any) {
  if (isSelectQueryError(supplier)) {
    return {
      id: '',
      name: 'Unknown Supplier',
      phone: '',
      email: ''
    };
  }
  return supplier || { id: '', name: 'Unknown Supplier', phone: '', email: '' };
}

/**
 * Creates a safe default object for purchase orders when we encounter SelectQueryError
 */
export function safePurchaseOrder(order: any) {
  if (isSelectQueryError(order)) {
    return {
      id: '',
      order_number: '',
      total_amount: 0
    };
  }
  return order || { id: '', order_number: '', total_amount: 0 };
}

/**
 * Creates a safe default object for delivery notes when we encounter SelectQueryError
 */
export function safeDeliveryNote(note: any) {
  if (isSelectQueryError(note)) {
    return {
      id: '',
      delivery_number: '',
    };
  }
  return note || { id: '', delivery_number: '' };
}

/**
 * Creates a safe default object for products when we encounter SelectQueryError
 */
export function safeProduct(product: any) {
  if (isSelectQueryError(product)) {
    return {
      id: '',
      name: 'Unknown Product',
      reference: '',
      category: ''
    };
  }
  return product || { id: '', name: 'Unknown Product', reference: '', category: '' };
}

/**
 * Safely handle properties that could be SelectQueryError
 */
export function safeGet<T>(obj: any, property: string, defaultValue: T): T {
  if (!obj || isSelectQueryError(obj)) {
    return defaultValue;
  }
  return obj[property] !== undefined ? obj[property] : defaultValue;
}

/**
 * Safely handle arrays that could be SelectQueryError
 */
export function safeArray<T>(items: any): T[] {
  if (!items || isSelectQueryError(items)) {
    return [];
  }
  return Array.isArray(items) ? items : [];
}

/**
 * Safe type conversion - tries to cast but falls back to default
 */
export function safeAs<T>(value: any, defaultValue: T): T {
  if (value === undefined || value === null || isSelectQueryError(value)) {
    return defaultValue;
  }
  return value as T;
}
