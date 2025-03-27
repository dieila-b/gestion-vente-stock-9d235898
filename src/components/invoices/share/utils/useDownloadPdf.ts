
import { RefObject } from 'react';
import { toast } from 'sonner';
import { usePdfGenerator } from './usePdfGenerator';

export function useDownloadPdf() {
  const { generatePDF } = usePdfGenerator();

  // Download invoice as PDF
  const downloadPdf = async (invoiceRef: RefObject<HTMLDivElement>, invoiceNumber: string) => {
    toast.loading("Génération du PDF en cours...");
    
    try {
      const pdfBlob = await generatePDF(invoiceRef);
      
      if (!pdfBlob) {
        toast.dismiss();
        toast.error("Erreur lors de la génération du PDF");
        return;
      }
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Facture_${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
      
      toast.dismiss();
      toast.success("PDF téléchargé avec succès");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      toast.dismiss();
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  return { downloadPdf };
}
