
import { RefObject, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

export function usePdfGenerator() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Generate PDF of the invoice
  const generatePDF = async (invoiceRef: RefObject<HTMLDivElement>): Promise<Blob | null> => {
    if (!invoiceRef.current) {
      toast.error("Erreur lors de la génération du PDF");
      return null;
    }

    try {
      setIsGeneratingPDF(true);
      
      // Get scaled canvas of the invoice for better quality
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      // Create PDF with proper dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // If image is longer than A4, add more pages
      let position = 0;
      let heightLeft = imgHeight;
      
      while (heightLeft > pageHeight) {
        position = heightLeft - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Return PDF as blob
      const pdfBlob = pdf.output('blob');
      return pdfBlob;
      
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      return null;
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return {
    generatePDF,
    isGeneratingPDF
  };
}
