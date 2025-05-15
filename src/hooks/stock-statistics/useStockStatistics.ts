
import { useWarehouseStockQuery } from './useWarehouseStockQuery';
import { transformWarehouseData } from './transformers';
import { StockItem } from './types';

export function useStockStatistics() {
  const { data: warehouseStockData, isLoading: isLoadingWarehouseStock } = useWarehouseStockQuery();
  
  // Ensure warehouseStockData is an array before transforming
  const warehouseStock = transformWarehouseData(Array.isArray(warehouseStockData) ? warehouseStockData : []);

  return {
    warehouseStock,
    isLoadingWarehouseStock
  };
}
