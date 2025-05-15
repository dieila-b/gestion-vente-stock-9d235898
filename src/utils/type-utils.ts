
export function isSelectQueryError(obj: any): boolean {
  return (
    obj !== null &&
    typeof obj === "object" &&
    obj.hasOwnProperty("code") &&
    obj.hasOwnProperty("message") &&
    obj.hasOwnProperty("details")
  );
}
