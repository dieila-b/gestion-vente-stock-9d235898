
import { StockItem } from './types';

/**
 * Transforms warehouse stock data into a standardized format for use in stock statistics
 * @param warehouseData Raw data from the warehouse_stock table
 * @returns Formatted array of StockItem objects
 */
export function transformWarehouseData(warehouseData: any[]): StockItem[] {
  if (!Array.isArray(warehouseData)) {
    console.error('Invalid warehouse data format:', warehouseData);
    return [];
  }
  
  try {
    return warehouseData.map(item => {
      // Ensure we have valid data
      if (!item || !item.product) {
        console.warn('Skipping invalid warehouse stock item:', item);
        return null;
      }
      
      return {
        id: item.id,
        warehouse_id: item.warehouse_id,
        name: item.warehouse?.name || "Entrepôt inconnu",
        quantity: item.quantity || 0,
        product: item.product,
        unit_price: item.unit_price || 0,
        total_value: item.total_value || 0,
      };
    }).filter(Boolean); // Remove any null items
  } catch (error) {
    console.error('Error transforming warehouse data:', error);
    return [];
  }
}
