
import { Button } from "@/components/ui/button";
import { NavigateFunction } from "react-router-dom";

interface PurchaseOrderHeaderProps {
  navigate: NavigateFunction;
}

export const PurchaseOrderHeader = ({ navigate }: PurchaseOrderHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Nouveau bon de commande</h1>
      <Button variant="outline" onClick={() => navigate("/purchase-orders")}>
        Retour
      </Button>
    </div>
  );
};
