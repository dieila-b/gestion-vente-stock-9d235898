
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InvoiceFormHeaderProps {
  onClose: () => void;
}

export const InvoiceFormHeader = ({ onClose }: InvoiceFormHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold text-gradient">Création de facture</h2>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onClose}
        className="hover:bg-white/10"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};
