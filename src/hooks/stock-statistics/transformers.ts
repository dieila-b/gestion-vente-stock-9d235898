
import { StockItem, WarehouseStockData } from './types';
import { isSelectQueryError } from "@/utils/supabase-safe-query";

export function transformWarehouseData(data: any[]): StockItem[] {
  // Ensure data is an array before attempting to map over it
  if (!Array.isArray(data)) {
    console.error("warehouseStockData is not an array:", data);
    return [];
  }
  
  return data.map(item => {
    if (isSelectQueryError(item)) {
      return {
        id: "",
        warehouse_id: "",
        name: "Unknown Warehouse",
        quantity: 0,
        product: null,
        unit_price: 0,
        total_value: 0
      };
    }
    
    const warehouse = safeWarehouse(item.warehouse);
    
    return {
      id: item.id || "",
      warehouse_id: item.warehouse_id || "",
      name: warehouse.name || "Unknown Warehouse",
      quantity: item.quantity || 0,
      unit_price: item.unit_price || 0,
      total_value: item.total_value || 0,
      product: item.product || null
    };
  });
}

function safeWarehouse(warehouse: any): { name: string } {
  if (!warehouse || isSelectQueryError(warehouse)) {
    return { name: "Unknown Warehouse" };
  }
  return {
    name: warehouse.name || "Unknown Warehouse"
  };
}
