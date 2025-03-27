
import { RefObject } from 'react';
import { toast } from 'sonner';
import { usePdfGenerator } from './usePdfGenerator';

export function useWhatsAppShare() {
  const { generatePDF } = usePdfGenerator();

  // Send invoice by WhatsApp
  const sendWhatsApp = async (
    clientPhone: string | undefined, 
    invoiceRef: RefObject<HTMLDivElement>,
    invoiceNumber: string,
    totalAmount: number,
    formatGNF: (amount: number) => string
  ) => {
    if (!clientPhone) {
      toast.error("Numéro de téléphone du client non disponible");
      return;
    }

    toast.loading("Préparation du message WhatsApp...");
    
    try {
      // Generate PDF
      const pdfBlob = await generatePDF(invoiceRef);
      
      if (!pdfBlob) {
        toast.dismiss();
        toast.error("Erreur lors de la génération du PDF pour WhatsApp");
        return;
      }
      
      // Format phone number for WhatsApp
      let phone = clientPhone.replace(/\s+/g, '');
      if (!phone.startsWith('+')) {
        phone = '+' + phone;
      }
      
      // Create text message
      const text = `Bonjour, voici votre facture ${invoiceNumber} d'un montant de ${formatGNF(totalAmount)}.`;
      
      // Step 1: Download PDF for user
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = `Facture_${invoiceNumber}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Step 2: Show instructions toast and open WhatsApp
      toast.dismiss();
      toast.success("PDF téléchargé. Suivez les étapes ci-dessous pour envoyer par WhatsApp:", {
        duration: 10000,
        description: "1. Le PDF est maintenant téléchargé\n2. WhatsApp va s'ouvrir\n3. Cliquez sur l'icône pièce jointe dans WhatsApp\n4. Sélectionnez le PDF téléchargé"
      });
      
      // Short delay before opening WhatsApp to ensure the toast is visible
      setTimeout(() => {
        // Open WhatsApp with the message
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text + ' Je vous joins la facture en pièce jointe.')}`;
        window.open(whatsappUrl, '_blank');
        
        // Clean up URL object
        URL.revokeObjectURL(pdfUrl);
      }, 1000);
      
    } catch (error) {
      console.error("Erreur lors de l'envoi via WhatsApp:", error);
      toast.dismiss();
      toast.error("Erreur lors de l'envoi via WhatsApp");
    }
  };

  return { sendWhatsApp };
}
