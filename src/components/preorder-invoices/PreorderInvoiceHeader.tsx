
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PreorderInvoiceHeaderProps {
  showUnpaidOnly: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  navigateToNewPreorder: () => void;
}

export function PreorderInvoiceHeader({
  showUnpaidOnly,
  searchTerm,
  setSearchTerm,
  navigateToNewPreorder
}: PreorderInvoiceHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">
        {showUnpaidOnly ? 'Précommandes Impayées' : 'Factures de Précommande'}
      </h1>
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        </div>
        <Button
          onClick={navigateToNewPreorder}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle précommande
        </Button>
      </div>
    </div>
  );
}
