
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POSLocation } from "@/types/pos-locations";

interface StockItemsFilterProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedLocation: string;
  setSelectedLocation: (value: string) => void;
  posLocations: POSLocation[];
}

export function StockItemsFilter({ 
  searchQuery, 
  setSearchQuery, 
  selectedLocation, 
  setSelectedLocation, 
  posLocations 
}: StockItemsFilterProps) {
  return (
    <div className="flex justify-between items-center">
      <Select 
        value={selectedLocation} 
        onValueChange={setSelectedLocation}
      >
        <SelectTrigger className="glass-effect w-[220px]">
          <SelectValue placeholder="Tous les PDV" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">Tous les PDV</SelectItem>
          {posLocations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}
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
