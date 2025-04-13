
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WarehouseSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddWarehouseClick: () => void;
}

export function WarehouseSearch({ 
  searchTerm, 
  onSearchChange, 
  onAddWarehouseClick 
}: WarehouseSearchProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-primary">Liste des Entrepôts</h2>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un entrepôt..."
            className="pl-9 w-[300px]"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button 
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-1"
          onClick={onAddWarehouseClick}
        >
          <span className="text-lg font-bold">+</span>
          <span>Nouvel entrepôt</span>
        </button>
      </div>
    </div>
  );
}
