
// This file is now just a re-export for backward compatibility
// New code should import from db-core directly
import { db } from "./db-core";

// Export the db object as default and named export
export { db };
export default db;
