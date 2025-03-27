
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchTransferProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const SearchTransfer = ({ searchQuery, onSearchChange }: SearchTransferProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input 
        placeholder="Rechercher un transfert..." 
        className="pl-10 glass-effect"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};
