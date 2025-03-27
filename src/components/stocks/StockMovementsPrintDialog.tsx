
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatGNF } from "@/lib/currency";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Printer } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface StockMovement {
  id: string;
  product: {
    id: string;
    name: string;
    reference: string;
  };
  warehouse: {
    id: string;
    name: string;
  };
  pos_location: {
    id: string;
    name: string;
  } | null | undefined;
  quantity: number;
  unit_price: number;
  total_value: number;
  reason: string;
  type: "in" | "out";
  created_at: string;
}

interface StockMovementsPrintDialogProps {
  movements: StockMovement[];
  type: "in" | "out";
}

export function StockMovementsPrintDialog({ movements, type }: StockMovementsPrintDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = async () => {
    const element = document.getElementById("stock-movements-print-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`mouvements-stock-${type === "in" ? "entrees" : "sorties"}.pdf`);
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'impression:", error);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="enhanced-glass"
      >
        <Printer className="w-4 h-4 mr-2" />
        Imprimer la liste
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl enhanced-glass border-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gradient">
              Aperçu avant impression
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <div id="stock-movements-print-content" className="bg-white text-black p-8 rounded-lg">
              <h1 className="text-2xl font-bold mb-6">
                Liste des {type === "in" ? "entrées" : "sorties"} de stock
              </h1>
              <p className="text-sm mb-4">
                Date d'impression: {format(new Date(), "Pp", { locale: fr })}
              </p>
              
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 text-left">Date</th>
                    <th className="border p-2 text-left">Article</th>
                    <th className="border p-2 text-left">Référence</th>
                    <th className="border p-2 text-left">Emplacement</th>
                    <th className="border p-2 text-right">Quantité</th>
                    <th className="border p-2 text-right">Prix unitaire</th>
                    <th className="border p-2 text-right">Valeur totale</th>
                    <th className="border p-2 text-left">Motif</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="border p-2">
                        {format(new Date(movement.created_at), "Pp", { locale: fr })}
                      </td>
                      <td className="border p-2">{movement.product.name}</td>
                      <td className="border p-2">{movement.product.reference}</td>
                      <td className="border p-2">
                        {movement.pos_location ? movement.pos_location.name : movement.warehouse.name}
                      </td>
                      <td className="border p-2 text-right">{movement.quantity}</td>
                      <td className="border p-2 text-right">
                        {formatGNF(movement.unit_price)}
                      </td>
                      <td className="border p-2 text-right">
                        {formatGNF(movement.total_value)}
                      </td>
                      <td className="border p-2">{movement.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <Button 
                onClick={handlePrint}
                className="enhanced-glass bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30"
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
}

