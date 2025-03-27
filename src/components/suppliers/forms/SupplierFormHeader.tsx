
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, ShoppingCart } from "lucide-react";

interface SupplierFormHeaderProps {
  type: "order" | "price-request";
  supplierName: string;
}

export const SupplierFormHeader = ({ type, supplierName }: SupplierFormHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-gradient">
        {type === "order" ? (
          <Package className="h-6 w-6" />
        ) : (
          <ShoppingCart className="h-6 w-6" />
        )}
        {type === "order" ? "Nouvelle Commande Fournisseur" : "Demande de Prix"}
      </CardTitle>
      <CardDescription className="text-white/60">
        {type === "order" 
          ? `Créez une nouvelle commande pour ${supplierName}`
          : `Demandez un devis pour des produits auprès de ${supplierName}`
        }
      </CardDescription>
    </CardHeader>
  );
};
