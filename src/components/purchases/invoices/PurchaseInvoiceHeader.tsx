
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PurchaseInvoiceHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const PurchaseInvoiceHeader = ({
  searchQuery,
  onSearchChange,
}: PurchaseInvoiceHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Factures d'achat</h1>
        <p className="text-muted-foreground">Gérez vos factures d'achat fournisseurs</p>
      </div>
      <div className="flex gap-4">
        <Input
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-[300px]"
        />
        <Button onClick={() => navigate("/purchase-invoices/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>
    </div>
  );
};
