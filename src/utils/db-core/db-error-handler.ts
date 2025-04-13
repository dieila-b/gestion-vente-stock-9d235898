
import { toast } from "sonner";

/**
 * Handles database operation errors consistently
 * 
 * @param operation The operation that failed (e.g., 'query', 'insert')
 * @param tableName The name of the table being operated on
 * @param error The error that occurred
 * @param showToast Whether to show a toast notification
 */
export function handleDbError(
  operation: string,
  tableName: string,
  error: unknown,
  showToast = true
): void {
  const errorMessage = `Error ${operation} ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
  console.error(errorMessage, error);
  
  if (showToast) {
    const friendlyTableName = tableName.charAt(0).toUpperCase() + tableName.slice(1).replace(/_/g, ' ');
    const operationLabel = getOperationLabel(operation);
    toast.error(`Erreur lors de ${operationLabel} ${friendlyTableName}`);
  }
}

/**
 * Gets a user-friendly operation label in French
 */
function getOperationLabel(operation: string): string {
  switch (operation.toLowerCase()) {
    case 'query':
      return 'la requête à';
    case 'insert':
      return 'l\'ajout dans';
    case 'update':
      return 'la mise à jour dans';
    case 'delete':
      return 'la suppression dans';
    default:
      return 'l\'opération sur';
  }
}

/**
 * Creates a proxy object that logs errors and returns mock data
 */
export function createErrorProxy(errorMessage: string) {
  const mockPromiseResponse = Promise.resolve({ 
    data: null, 
    error: { message: errorMessage },
    count: 0
  });
  
  const handler = {
    get: (target: any, prop: string) => {
      if (typeof prop === 'symbol') {
        return () => mockPromiseResponse;
      }
      
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return mockPromiseResponse[prop].bind(mockPromiseResponse);
      }
      
      if (typeof target[prop] === 'function') {
        return (...args: any[]) => {
          console.error(errorMessage);
          // Don't show toast for every proxy method to avoid flooding
          if (['single', 'execute', 'maybeSingle', 'select'].includes(prop)) {
            toast.error(errorMessage);
          }
          return createErrorProxy(`${errorMessage} (${prop})`);
        };
      }
      
      return createErrorProxy(`${errorMessage} (${prop})`);
    }
  };

  return new Proxy({}, handler);
}
