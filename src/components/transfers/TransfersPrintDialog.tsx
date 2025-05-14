
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
import { Transfer } from "@/types/transfer";
import { formatGNF } from "@/lib/currency";

interface TransfersPrintDialogProps {
  transfers: Transfer[];
}

export function TransfersPrintDialog({ transfers }: TransfersPrintDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    documentTitle: "Transferts de stock",
    onBeforePrint: () => {
      setIsPrinting(true);
      return Promise.resolve(); // Return a Promise to satisfy the type constraint
    },
    onAfterPrint: () => {
      setIsPrinting(false);
    },
    pageStyle: "@page { size: auto; margin: 10mm; }",
    // Use contentRef instead of the deprecated content property
    contentRef: printRef,
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
          <DialogTitle>Imprimer les transferts</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <Button 
            onClick={() => {
              if (handlePrint) {
                handlePrint();
              }
            }}
            disabled={isPrinting}
          >
            {isPrinting ? "Impression en cours..." : "Imprimer maintenant"}
          </Button>
          
          <div className="hidden">
            <div ref={printRef} className="p-8">
              <h1 className="text-2xl font-bold mb-6">Transferts de stock</h1>
              <p className="mb-4">Date d'impression: {format(new Date(), 'PPP', { locale: fr })}</p>
              
              {/* Table of transfers */}
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Référence</th>
                    <th className="text-left py-2">Source</th>
                    <th className="text-left py-2">Destination</th>
                    <th className="text-left py-2">Produit</th>
                    <th className="text-left py-2">Quantité</th>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => (
                    <tr key={transfer.id} className="border-b">
                      <td className="py-2">{transfer.reference}</td>
                      <td className="py-2">{transfer.source_warehouse?.name}</td>
                      <td className="py-2">{transfer.destination_warehouse?.name}</td>
                      <td className="py-2">{transfer.product?.name}</td>
                      <td className="py-2">{transfer.quantity}</td>
                      <td className="py-2">
                        {transfer.created_at && 
                          format(new Date(transfer.created_at), 'dd/MM/yyyy')}
                      </td>
                      <td className="py-2">
                        {transfer.status === 'completed' ? 'Terminé' :
                         transfer.status === 'pending' ? 'En attente' :
                         transfer.status === 'cancelled' ? 'Annulé' : transfer.status}
                      </td>
                    </tr>
                  ))}
                  {transfers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-4 text-center">Aucun transfert disponible</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
