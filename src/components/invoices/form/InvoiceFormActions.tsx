
import { Button } from "@/components/ui/button";
import { Save, FileType, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";

interface InvoiceFormActionsProps {
  onSubmit: () => void;
  formData: {
    invoiceNumber: string;
    clientName: string;
    clientEmail: string;
    amount: string;
    description: string;
    vatRate: string;
    signature: string;
    discount: string;
  };
}

export const InvoiceFormActions = ({ onSubmit, formData }: InvoiceFormActionsProps) => {
  const handleExportPDF = () => {
    try {
      const doc = generateInvoicePDF(formData);
      doc.save(`facture-${formData.invoiceNumber}.pdf`);
      toast.success("PDF généré avec succès");
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  const handleExportExcel = () => {
    toast.info("Export Excel en cours...", {
      description: "Cette fonctionnalité sera bientôt disponible"
    });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Button 
        type="submit"
        onClick={onSubmit}
        className="enhanced-glass hover:scale-105 transition-transform duration-300 col-span-2"
      >
        <Save className="mr-2 h-4 w-4" />
        Enregistrer
      </Button>
      <Button 
        type="button"
        variant="outline"
        onClick={handleExportPDF}
        className="enhanced-glass hover:scale-105 transition-transform duration-300"
      >
        <FileType className="mr-2 h-4 w-4" />
        PDF
      </Button>
      <Button 
        type="button"
        variant="outline"
        onClick={handleExportExcel}
        className="enhanced-glass hover:scale-105 transition-transform duration-300"
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Excel
      </Button>
    </div>
  );
};
