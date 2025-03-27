
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Supplier } from "@/types/supplier";

interface SupplierValidationCardProps {
  supplier: Supplier;
  onValidate: (supplierId: string) => void;
  onReject: (supplierId: string) => void;
}

export const SupplierValidationCard = ({ supplier, onValidate, onReject }: SupplierValidationCardProps) => {
  return (
    <div className="glass-effect p-4 rounded-lg space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gradient">{supplier.name}</h3>
          <p className="text-sm text-muted-foreground">{supplier.contact}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-500 border border-yellow-500/20">
          En attente
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{supplier.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{supplier.phone}</span>
        </div>
      </div>

      <div className="pt-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full glass-effect hover:bg-green-500/20 hover:text-green-500"
          onClick={() => onValidate(supplier.id)}
        >
          <Check className="h-4 w-4 mr-2" />
          Valider
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full glass-effect hover:bg-red-500/20 hover:text-red-500"
          onClick={() => onReject(supplier.id)}
        >
          <X className="h-4 w-4 mr-2" />
          Rejeter
        </Button>
      </div>
    </div>
  );
};
