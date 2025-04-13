
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchTransferProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchTransfer = ({ searchQuery, onSearchChange }: SearchTransferProps) => {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Rechercher un transfert..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-8 bg-background/50 border-white/10 focus:border-white/20 transition-all"
      />
    </div>
  );
};
