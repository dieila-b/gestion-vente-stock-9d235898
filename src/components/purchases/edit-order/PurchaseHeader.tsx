
import { NavigateFunction } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, FileText } from "lucide-react";

interface PurchaseHeaderProps {
  id?: string;
  navigate: NavigateFunction;
  handleSubmit: () => void;
}

export const PurchaseHeader = ({ id, navigate, handleSubmit }: PurchaseHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {id ? "Modifier" : "Nouveau"} Bon de Commande
        </h1>
        <p className="text-gray-400">
          {id ? "Modifiez les détails du" : "Créez un nouveau"} bon de commande
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => navigate("/purchase-orders")}
          className="neo-blur"
        >
          <X className="w-4 h-4 mr-2" />
          Annuler
        </Button>
        <Button variant="outline" className="neo-blur">
          <FileText className="w-4 h-4 mr-2" />
          Aperçu
        </Button>
        <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700">
          Enregistrer
        </Button>
      </div>
    </div>
  );
};
