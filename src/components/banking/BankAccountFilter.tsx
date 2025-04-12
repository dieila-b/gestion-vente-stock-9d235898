
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface BankAccountFilterProps {
  filterText: string;
  setFilterText: (text: string) => void;
}

export function BankAccountFilter({ filterText, setFilterText }: BankAccountFilterProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Rechercher un compte bancaire..."
        className="pl-8"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />
    </div>
  );
}
