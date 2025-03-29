
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface POSLocationSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function POSLocationSearchBar({ searchQuery, setSearchQuery }: POSLocationSearchBarProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h2 className="text-lg font-semibold text-[#8A85FF]">Liste des PDV</h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Rechercher un PDV..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[#1E1E1E] border-[#333] w-full md:w-60 lg:w-72"
        />
      </div>
    </div>
  );
}
