
/**
 * Safely spread properties from an object that might be a SelectQueryError
 * This version handles correctly the TypeScript typing issue
 */
export function safeSpread<T extends object>(obj: any, defaultObj: T): T {
  if (isSelectQueryError(obj) || !obj) return defaultObj;
  if (typeof obj !== 'object') return defaultObj;
  
  return { ...defaultObj, ...obj } as T;
}
