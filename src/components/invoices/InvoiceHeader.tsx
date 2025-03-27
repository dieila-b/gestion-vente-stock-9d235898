
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface InvoiceHeaderProps {
  onGenerateInvoice: () => void;
}

export const InvoiceHeader = ({ onGenerateInvoice }: InvoiceHeaderProps) => {
  return (
    <div className="flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-4">
        <FileText className="h-8 w-8 text-purple-400" />
        <h1 className="text-3xl font-bold text-gradient">Nouvelle facture</h1>
      </div>
      <Button 
        onClick={onGenerateInvoice}
        className="enhanced-glass hover:scale-105 transition-transform duration-300"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Créer une facture
      </Button>
    </div>
  );
};
