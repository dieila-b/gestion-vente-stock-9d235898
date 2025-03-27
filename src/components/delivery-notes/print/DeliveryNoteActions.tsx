
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { DeliveryNote } from "@/types/delivery-note";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface DeliveryNoteActionsProps {
  note: DeliveryNote;
  printContentRef: React.RefObject<HTMLDivElement>;
}

export function DeliveryNoteActions({ note, printContentRef }: DeliveryNoteActionsProps) {
  // Function to open the print view in a new window
  const handlePrintInNewWindow = () => {
    if (!printContentRef.current) return;
    
    const printContent = printContentRef.current.innerHTML;
    const newWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Bon de livraison ${note.delivery_number}</title>
            <style>
              body { font-family: Arial, sans-serif; background-color: white; color: black; }
              .print-container { width: 210mm; margin: 0 auto; padding: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 8px; }
              th { background-color: #8B0000; color: white; }
              .total-table { width: 33%; margin-left: auto; }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${printContent}
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ouvrir une nouvelle fenêtre. Veuillez vérifier les paramètres de votre navigateur.",
      });
    }
  };

  const handleDownload = async () => {
    if (!printContentRef.current) return;

    try {
      const canvas = await html2canvas(printContentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight()));
      pdf.save(`bon_livraison_${note.delivery_number}.pdf`);
      
      toast({
        title: "Téléchargement réussi",
        description: "Le bon de livraison a été téléchargé en format PDF",
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast({
        variant: "destructive",
        title: "Erreur de téléchargement",
        description: "Impossible de générer le PDF. Veuillez réessayer.",
      });
    }
  };

  return (
    <div className="flex justify-end p-4 gap-2">
      <Button 
        onClick={handlePrintInNewWindow}  
        variant="outline"
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Imprimer
      </Button>
      
      <Button 
        onClick={handleDownload}  
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Télécharger
      </Button>
    </div>
  );
}
