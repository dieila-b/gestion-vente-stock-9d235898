
import { StockEntryForm } from "../useStockMovementTypes";

export interface StockEntryResult {
  success: boolean;
  error?: Error | string;
}

export interface UseStockEntriesReturn {
  createStockEntry: (data: StockEntryForm) => Promise<boolean>;
  isLoading: boolean;
}
