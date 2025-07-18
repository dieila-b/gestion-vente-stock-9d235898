
import { useWarehouseStockQuery } from './useWarehouseStockQuery';
import { transformWarehouseData } from './transformers';
import { StockItem } from './types';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useStockStatistics() {
  const queryClient = useQueryClient();
  const { 
    data: warehouseStockData, 
    isLoading: isLoadingWarehouseStock, 
    refetch, 
    isError 
  } = useWarehouseStockQuery();
  
  console.log("Raw warehouse stock data:", warehouseStockData);
  
  // Transform warehouse stock data
  const warehouseStock = transformWarehouseData(Array.isArray(warehouseStockData) ? warehouseStockData : []);
  
  console.log("Transformed warehouse stock:", warehouseStock);

  // Function to refresh stock data
  const refreshStockData = () => {
    toast.info("Actualisation des statistiques de stock", {
      description: "Les données sont en cours de mise à jour..."
    });
    
    queryClient.invalidateQueries({ queryKey: ['warehouse-stock-statistics'] });
    queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
    queryClient.invalidateQueries({ queryKey: ['catalog'] });
    queryClient.invalidateQueries({ queryKey: ['stock-stats'] });
    
    refetch();
  };

  return {
    warehouseStock,
    isLoadingWarehouseStock,
    isError,
    refreshStockData
  };
}
