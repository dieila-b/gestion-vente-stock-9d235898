
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PurchaseOrderHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const PurchaseOrderHeader = ({
  searchQuery,
  onSearchChange,
}: PurchaseOrderHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Bons de commande</h1>
        <p className="text-muted-foreground">Gérez vos bons de commande fournisseurs</p>
      </div>
      <div className="flex gap-4">
        <Input
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-[300px]"
        />
        <Button onClick={() => navigate("/purchase-orders/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>
    </div>
  );
};
