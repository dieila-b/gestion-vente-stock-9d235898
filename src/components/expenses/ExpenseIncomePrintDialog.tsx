
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Printer } from "lucide-react";
import { useState } from "react";

interface ExpenseIncomePrintDialogProps {
  entries: Array<{
    id: string;
    date: string;
    category: { name: string };
    description: string;
    amount: number;
  }>;
  title: string;
}

export const ExpenseIncomePrintDialog = ({ entries, title }: ExpenseIncomePrintDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = async () => {
    const element = document.getElementById('expense-income-print-content');
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
      pdf.save(`${title.toLowerCase().replace(/ /g, '-')}.pdf`);
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'impression:", error);
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
            <div id="expense-income-print-content" className="bg-white text-black p-8 rounded-lg">
              <h1 className="text-2xl font-bold mb-6">{title}</h1>
              <p className="text-sm mb-4">Date d'impression: {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
              
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 text-left">Date</th>
                    <th className="border p-2 text-left">Catégorie</th>
                    <th className="border p-2 text-left">Description</th>
                    <th className="border p-2 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="border p-2">
                        {format(new Date(entry.date), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </td>
                      <td className="border p-2">{entry.category.name}</td>
                      <td className="border p-2">{entry.description}</td>
                      <td className="border p-2 text-right">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'GNF'
                        }).format(entry.amount)}
                      </td>
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
