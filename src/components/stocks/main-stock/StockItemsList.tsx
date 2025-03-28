
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StockItemsTable } from "./StockItemsTable";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Warehouse {
  id: string;
  name: string;
}

interface StockItem {
  id: string;
  product?: {
    reference?: string;
    name?: string;
    category?: string;
  };
  warehouse_id?: string;
  warehouse?: {
    name: string;
  };
  quantity: number;
  unit_price: number;
  total_value: number;
}

interface StockItemsListProps {
  items: StockItem[];
  warehouses: Warehouse[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery?: (query: string) => void;
}

export function StockItemsList({ 
  items, 
  warehouses, 
  isLoading, 
  searchQuery,
  setSearchQuery 
}: StockItemsListProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("_all");

  const filteredItems = items.filter((item) => {
    const matchesWarehouse = selectedWarehouse === "_all" 
      ? true 
      : item.warehouse_id === selectedWarehouse;
    
    const matchesSearch = searchQuery.toLowerCase().trim() === "" 
      ? true 
      : (item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.product?.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.product?.category?.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesWarehouse && matchesSearch;
  });

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gradient">
          {selectedWarehouse === "_all" 
            ? "Liste des Articles" 
            : `Liste des Articles - ${warehouses.find(w => w.id === selectedWarehouse)?.name || ""}`}
        </h2>
        {setSearchQuery && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Rechercher un article..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-effect w-60"
            />
          </div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Select
          value={selectedWarehouse}
          onValueChange={setSelectedWarehouse}
        >
          <SelectTrigger className="w-[200px] glass-effect">
            <SelectValue placeholder="Sélectionner un entrepôt" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Tous les entrepôts</SelectItem>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
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
