
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SalesInvoicesHeaderProps {
  showUnpaidOnly: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function SalesInvoicesHeader({
  showUnpaidOnly,
  searchTerm,
  setSearchTerm
}: SalesInvoicesHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">
        {showUnpaidOnly ? 'Factures Impayées' : 'Factures de vente'}
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
          onClick={() => navigate('/pos')}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle facture
        </Button>
      </div>
    </div>
  );
}
