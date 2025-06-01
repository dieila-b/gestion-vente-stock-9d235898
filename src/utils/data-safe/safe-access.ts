
/**
 * Safe data access utilities to prevent undefined/null errors
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current?.[key] === undefined || current?.[key] === null) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current !== undefined && current !== null ? current : defaultValue;
}

export function safeArray<T>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}

export function safeNumber(value: any, defaultValue: number = 0): number {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}

export function safeString(value: any, defaultValue: string = ''): string {
  return value != null ? String(value) : defaultValue;
}

export function safeBoolean(value: any, defaultValue: boolean = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return defaultValue;
}
