
import { tableQuery, query, insert, update, deleteRecord } from "./db-table-operations";

// Export convenient shorthand functions
export const db = {
  table: tableQuery,
  query,
  insert,
  update,
  delete: deleteRecord
};

// Also export individual functions for more granular imports
export { tableQuery, query, insert, update, deleteRecord };
