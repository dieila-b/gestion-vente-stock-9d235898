
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface POSStockFilterProps {
  posSearchQuery: string;
  setPosSearchQuery: (value: string) => void;
}

export function POSStockFilter({ posSearchQuery, setPosSearchQuery }: POSStockFilterProps) {
  return (
    <div className="flex gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Rechercher..." 
          value={posSearchQuery}
          onChange={(e) => setPosSearchQuery(e.target.value)}
          className="pl-10 glass-effect"
        />
      </div>
      <Button variant="outline" className="glass-effect">
        <Filter className="h-4 w-4 mr-2" />
        Filtrer
      </Button>
    </div>
  );
}
