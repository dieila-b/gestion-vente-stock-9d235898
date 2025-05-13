
import { useStockQuery } from './useStockQuery';
import { useStockEntries } from './useStockEntries';
import { useStockExits } from './useStockExits';
import type { StockEntryForm } from './useStockMovementTypes';
export type { StockMovement } from './useStockMovementTypes';
export { stockEntrySchema } from './useStockMovementTypes';

export function useStockMovements(type: 'in' | 'out') {
  const { movements, isLoading, warehouses, products } = useStockQuery(type);
  const { createStockEntry } = useStockEntries();
  const { createStockExit } = useStockExits();

  return {
    movements,
    isLoading,
    warehouses,
    products,
    createStockEntry,
    createStockExit
  };
}
