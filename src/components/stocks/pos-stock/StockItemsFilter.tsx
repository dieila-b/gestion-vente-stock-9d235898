
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StockItemsFilterProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedWarehouse: string;
  setSelectedWarehouse: (value: string) => void;
  warehouses: any[];
}

export function StockItemsFilter({ 
  searchQuery, 
  setSearchQuery, 
  selectedWarehouse, 
  setSelectedWarehouse, 
  warehouses 
}: StockItemsFilterProps) {
  return (
    <div className="flex justify-between items-center">
      <Select 
        value={selectedWarehouse} 
        onValueChange={setSelectedWarehouse}
      >
        <SelectTrigger className="glass-effect w-[220px]">
          <SelectValue placeholder="Tous les entrepôts" />
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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Rechercher un article..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 glass-effect w-80"
        />
      </div>
    </div>
  );
}
