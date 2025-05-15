
export function isSelectQueryError(obj: any): boolean {
  return (
    obj !== null &&
    typeof obj === "object" &&
    obj.hasOwnProperty("code") &&
    obj.hasOwnProperty("message") &&
    obj.hasOwnProperty("details")
  );
}

// Add the isObject utility function
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
