
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface POSStockFilterProps {
  posSearchQuery: string;
  setPosSearchQuery: (value: string) => void;
}

export function POSStockFilter({ posSearchQuery, setPosSearchQuery }: POSStockFilterProps) {
  return (
    <div className="relative w-full md:w-60 lg:w-72">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input 
        placeholder="Rechercher..." 
        value={posSearchQuery}
        onChange={(e) => setPosSearchQuery(e.target.value)}
        className="pl-10 bg-[#1E1E1E] border-[#333]"
      />
    </div>
  );
}
