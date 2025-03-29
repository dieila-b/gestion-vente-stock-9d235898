
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
  
  // Extract warehouses from items
  const warehouses = Array.from(new Set(
    items
      .filter(item => item.warehouse?.id)
      .map(item => ({ id: item.warehouse?.id, name: item.warehouse?.name }))
  )).filter(Boolean) as { id?: string, name: string }[];
  
  // Filter items by selected warehouse
  const filteredItems = selectedWarehouse === "_all" 
    ? items 
    : items.filter(item => item.warehouse?.id === selectedWarehouse);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gradient">Liste des Entrepôts</h3>
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
