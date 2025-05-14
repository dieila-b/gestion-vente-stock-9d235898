
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Transfer } from "@/types/transfer";
import { safeFormatDate } from "@/utils/date-utils";

interface TransfersPrintDialogProps {
  transfers: Transfer[];
}

export function TransfersPrintDialog({ transfers }: TransfersPrintDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    documentTitle: "Transferts de Stock",
    onBeforePrint: () => setIsPrinting(true),
    onAfterPrint: () => setIsPrinting(false),
    content: () => printRef.current,
    // Return Promise<void> to fix the type error
    promise: Promise.resolve(),
  });

  // Helper function to get source name based on transfer type
  const getSourceName = (transfer: Transfer): string => {
    if (transfer.transfer_type === "depot_to_pos") {
      return transfer.source_warehouse?.name || "-";
    } else if (transfer.transfer_type === "pos_to_depot") {
      return transfer.source_pos?.name || "-";
    } else {
      return transfer.source_warehouse?.name || "-";
    }
  };

  // Helper function to get destination name based on transfer type
  const getDestinationName = (transfer: Transfer): string => {
    if (transfer.transfer_type === "depot_to_pos") {
      return transfer.destination_pos?.name || "-";
    } else if (transfer.transfer_type === "pos_to_depot") {
      return transfer.destination_warehouse?.name || "-";
    } else {
      return transfer.destination_warehouse?.name || "-";
    }
  };

  // Helper function to get status text
  const getStatusText = (status: string | undefined): string => {
    if (!status) return "En attente";
    
    switch (status) {
      case "completed": return "Terminé";
      case "cancelled": return "Annulé";
      default: return "En attente";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Printer className="h-4 w-4" />
          <span>Imprimer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Imprimer les transferts</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Cette impression contient {transfers.length} transfert(s).
          </p>
          
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            className="w-full"
          >
            {isPrinting ? "Impression en cours..." : "Imprimer maintenant"}
          </Button>
          
          <div className="hidden">
            <div ref={printRef} className="p-8 bg-white text-black">
              <div className="mb-8">
                <h1 className="text-2xl font-bold">Transferts de Stock</h1>
                <p className="text-sm text-gray-500">
                  Date d'impression: {safeFormatDate(new Date().toISOString(), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
              
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Référence</th>
                    <th className="border p-2 text-left">Date</th>
                    <th className="border p-2 text-left">Source</th>
                    <th className="border p-2 text-left">Destination</th>
                    <th className="border p-2 text-left">Statut</th>
                    <th className="border p-2 text-left">Quantité</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border p-2 text-center">
                        Aucun transfert trouvé
                      </td>
                    </tr>
                  ) : (
                    transfers.map((transfer, index) => (
                      <tr key={transfer.id || index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="border p-2">{transfer.reference || `Transfer-${transfer.id?.substring(0, 8)}`}</td>
                        <td className="border p-2">{safeFormatDate(transfer.transfer_date || transfer.created_at)}</td>
                        <td className="border p-2">{getSourceName(transfer)}</td>
                        <td className="border p-2">{getDestinationName(transfer)}</td>
                        <td className="border p-2">
                          {getStatusText(transfer.status)}
                        </td>
                        <td className="border p-2">{transfer.quantity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              {transfers.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-bold mb-2">Notes</h3>
                  <div className="border p-4 rounded min-h-[100px]">
                    {transfers.length === 1 ? transfers[0].notes : 'Notes multiples non affichées pour plusieurs transferts.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
