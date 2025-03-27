
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, CreditCard, Settings } from "lucide-react";
import { toast } from "sonner";
import { StandardInvoiceForm } from "./StandardInvoiceForm";
import { CustomInvoiceForm } from "./CustomInvoiceForm";
import { useState } from "react";

export const InvoiceTypeCard = () => {
  const [showStandardForm, setShowStandardForm] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const handleStandardInvoice = () => {
    setShowStandardForm(true);
    setShowCustomForm(false);
    toast.success("Création d'une facture standard");
  };

  const handleCustomInvoice = () => {
    setShowCustomForm(true);
    setShowStandardForm(false);
    toast.success("Création d'une facture personnalisée");
  };

  return (
    <Card className="enhanced-glass p-8 rounded-xl space-y-6 animate-fade-in hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gradient">Types de factures</h2>
        <Settings className="h-5 w-5 text-purple-400 animate-spin-slow" />
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="enhanced-glass hover:scale-105 transition-transform duration-300 flex items-center justify-center py-8"
            onClick={handleStandardInvoice}
          >
            <div className="flex flex-col items-center gap-2">
              <Receipt className="h-8 w-8 text-purple-400" />
              <span>Facture standard</span>
            </div>
          </Button>
          <Button 
            variant="outline"
            className="enhanced-glass hover:scale-105 transition-transform duration-300 flex items-center justify-center py-8"
            onClick={handleCustomInvoice}
          >
            <div className="flex flex-col items-center gap-2">
              <CreditCard className="h-8 w-8 text-purple-400" />
              <span>Facture personnalisée</span>
            </div>
          </Button>
        </div>

        {showStandardForm && (
          <StandardInvoiceForm onClose={() => setShowStandardForm(false)} />
        )}

        {showCustomForm && (
          <CustomInvoiceForm onClose={() => setShowCustomForm(false)} />
        )}
      </div>
    </Card>
  );
};
