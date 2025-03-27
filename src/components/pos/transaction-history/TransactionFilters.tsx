
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransactionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: "all" | "today" | "week" | "month";
  onFilterChange: (value: "all" | "today" | "week" | "month") => void;
}

export function TransactionFilters({ 
  search, 
  onSearchChange, 
  filter, 
  onFilterChange 
}: TransactionFiltersProps) {
  return (
    <div className="flex items-center gap-4 my-4">
      <Input
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-xs"
      />
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrer par période" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les périodes</SelectItem>
          <SelectItem value="today">Aujourd'hui</SelectItem>
          <SelectItem value="week">Cette semaine</SelectItem>
          <SelectItem value="month">Ce mois</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
