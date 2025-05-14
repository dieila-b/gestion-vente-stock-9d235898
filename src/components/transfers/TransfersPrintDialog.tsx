
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Transfer } from "@/types/transfer";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Printer } from "lucide-react";
import { useState } from "react";

interface TransfersPrintDialogProps {
  transfers: Transfer[];
  transferItems: { transfer_id: string; quantity: number }[];
}

export const TransfersPrintDialog = ({ transfers, transferItems }: TransfersPrintDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getTransferQuantity = (transferId: string) => {
    // Safely check if items exist before accessing them
    const items = transfers.find(t => t.id === transferId)?.items || [];
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const getTransferTypeLabel = (transfer: Transfer) => {
    switch (transfer.transfer_type) {
      case "depot_to_pos":
        return "Dépôt → Point de vente";
      case "pos_to_depot":
        return "Point de vente → Dépôt";
      case "depot_to_depot":
        return "Dépôt → Dépôt";
      default:
        return "Type inconnu";
    }
  };

  const getSourceName = (transfer: Transfer) => {
    // Safe check for transfer_type before accessing source properties
    if (!transfer.transfer_type) return "N/A";
    
    switch (transfer.transfer_type) {
      case "depot_to_pos":
      case "depot_to_depot":
        return transfer.source_warehouse?.name || "N/A";
      case "pos_to_depot":
        return transfer.source_pos?.name || "N/A";
      default:
        return "N/A";
    }
  };

  const getDestinationName = (transfer: Transfer) => {
    // Safe check for transfer_type before accessing destination properties
    if (!transfer.transfer_type) return "N/A";
    
    switch (transfer.transfer_type) {
      case "depot_to_pos":
        return transfer.destination_pos?.name || "N/A";
      case "pos_to_depot":
      case "depot_to_depot":
        return transfer.destination_warehouse?.name || "N/A";
      default:
        return "N/A";
    }
  };

  const handlePrint = async () => {
    const element = document.getElementById('transfers-print-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('liste-transferts.pdf');
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setIsOpen(true)}
        className="glass-effect"
      >
        <Printer className="w-4 h-4 mr-2" />
        Imprimer
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl glass-panel border-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gradient">
              Aperçu avant impression
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <div id="transfers-print-content" className="bg-white text-black p-8 rounded-lg">
              <h1 className="text-2xl font-bold mb-6">Liste des Transferts</h1>
              <p className="text-sm mb-4">Date d'impression: {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
              
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 text-left">Référence</th>
                    <th className="border p-2 text-left">Date</th>
                    <th className="border p-2 text-left">Type</th>
                    <th className="border p-2 text-left">Source</th>
                    <th className="border p-2 text-left">Destination</th>
                    <th className="border p-2 text-left">Quantité</th>
                    <th className="border p-2 text-left">Statut</th>
                    <th className="border p-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => (
                    <tr key={transfer.id}>
                      <td className="border p-2">{transfer.reference || "-"}</td>
                      <td className="border p-2">
                        {transfer.transfer_date 
                          ? format(new Date(transfer.transfer_date), "dd/MM/yyyy")
                          : format(new Date(transfer.created_at), "dd/MM/yyyy")}
                      </td>
                      <td className="border p-2">{getTransferTypeLabel(transfer)}</td>
                      <td className="border p-2">{getSourceName(transfer)}</td>
                      <td className="border p-2">{getDestinationName(transfer)}</td>
                      <td className="border p-2">{getTransferQuantity(transfer.id)}</td>
                      <td className="border p-2">
                        {transfer.status === "completed" ? "Terminé" :
                         transfer.status === "cancelled" ? "Annulé" :
                         "En attente"}
                      </td>
                      <td className="border p-2">{transfer.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <Button 
                onClick={handlePrint}
                className="glass-effect bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30"
              >
                <Printer className="w-4 h-4 mr-2" />
                Générer le PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
