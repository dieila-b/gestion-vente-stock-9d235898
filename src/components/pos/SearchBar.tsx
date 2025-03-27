
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;  // Added for backward compatibility
}

export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Rechercher un produit..."
        className="pl-10 glass-effect"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
