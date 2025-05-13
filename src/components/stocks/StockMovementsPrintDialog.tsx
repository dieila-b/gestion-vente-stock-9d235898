
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { StockMovement } from "@/hooks/stocks/useStockMovementTypes";
import { formatGNF } from "@/lib/currency";

export function StockMovementsPrintDialog() {
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    documentTitle: "Mouvements de stock",
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsPrinting(false);
    },
    pageStyle: "@page { size: auto; margin: 10mm; }",
    // Using printRef as the reference to the content to print
    documentRef: printRef,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Printer className="h-4 w-4" />
          <span>Imprimer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Imprimer les mouvements de stock</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <Button 
            onClick={() => handlePrint()}
            disabled={isPrinting}
          >
            {isPrinting ? "Impression en cours..." : "Imprimer maintenant"}
          </Button>
          
          <div className="hidden">
            <div ref={printRef} className="p-8">
              <h1 className="text-2xl font-bold mb-6">Mouvements de stock</h1>
              <p className="mb-4">Date d'impression: {format(new Date(), 'PPP', { locale: fr })}</p>
              
              {/* Le contenu réel sera injecté ici dynamiquement lors de l'impression */}
              <div className="print-content">
                <p>Ce rapport affiche les mouvements de stock enregistrés dans le système.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
