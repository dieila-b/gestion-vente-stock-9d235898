
import { tableQuery, query, insert, update, deleteRecord, count } from "./db-table-operations";

// Export convenient shorthand functions
export const db = {
  table: tableQuery,
  query,
  insert,
  update,
  delete: deleteRecord,
  count
};

// Also export individual functions for more granular imports
export { tableQuery, query, insert, update, deleteRecord, count };
