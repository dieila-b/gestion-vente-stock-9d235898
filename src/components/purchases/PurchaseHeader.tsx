
import { Button } from "@/components/ui/button";
import { FileText, Send, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PurchaseHeaderProps {
  onSubmit: () => void;
  orderNumber?: string;
  isSubmitting: boolean;
  isEditing: boolean;  // Ajout de la nouvelle prop
}

export const PurchaseHeader = ({ onSubmit, orderNumber, isSubmitting, isEditing }: PurchaseHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gradient">
          {isEditing ? "Modifier le Bon de Commande" : "Nouveau Bon de Commande"} {orderNumber && `- ${orderNumber}`}
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? "Modifiez votre bon de commande" : "Créez un nouveau bon de commande"} en sélectionnant un client, un fournisseur et des produits
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="neo-blur"
          onClick={() => navigate("/purchase-orders")}
        >
          <X className="w-4 h-4 mr-2" />
          Annuler
        </Button>
        <Button variant="outline" className="neo-blur">
          <FileText className="w-4 h-4 mr-2" />
          Aperçu
        </Button>
        <Button onClick={onSubmit} className="neo-blur" disabled={isSubmitting}>
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  );
};
