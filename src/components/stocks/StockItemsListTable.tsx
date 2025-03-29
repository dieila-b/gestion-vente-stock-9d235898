
import { useState } from "react";
import { StockItemsTable } from "./stock-table/StockItemsTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StockItem {
  id: string;
  product?: {
    reference?: string;
    name?: string;
    category?: string;
  };
  warehouse?: {
    id?: string;
    name: string;
  };
  quantity: number;
  unit_price: number;
  total_value: number;
}

interface StockItemsListTableProps {
  items: StockItem[];
  isLoading: boolean;
}

export function StockItemsListTable({ items, isLoading }: StockItemsListTableProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("_all");
  
  // Extract unique warehouses from items using a Map to deduplicate by ID
  const warehousesMap = new Map();
  items
    .filter(item => item.warehouse?.id)
    .forEach(item => {
      if (item.warehouse?.id && !warehousesMap.has(item.warehouse.id)) {
        warehousesMap.set(item.warehouse.id, { 
          id: item.warehouse.id, 
          name: item.warehouse.name 
        });
      }
    });
  
  // Convert Map to array
  const warehouses = Array.from(warehousesMap.values()) as { id?: string, name: string }[];
  
  // Filter items by selected warehouse
  const filteredItems = selectedWarehouse === "_all" 
    ? items 
    : items.filter(item => item.warehouse?.id === selectedWarehouse);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gradient">Liste des Articles</h3>
        <Select
          value={selectedWarehouse}
          onValueChange={setSelectedWarehouse}
        >
          <SelectTrigger className="w-[220px] glass-effect">
            <SelectValue placeholder="Tous les entrepôts" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="_all">Tous les entrepôts</SelectItem>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id || ""}>
                {warehouse.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <StockItemsTable items={filteredItems} isLoading={isLoading} />
    </div>
  );
}
