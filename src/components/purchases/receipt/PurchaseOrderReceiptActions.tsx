
import { Button } from "@/components/ui/button";
import { Printer, Mail, Download, Share2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useReactToPrint } from "react-to-print";
import { RefObject } from "react";

interface PurchaseOrderReceiptActionsProps {
  showPrintButton: boolean;
  showShareButtons: boolean;
  orderNumber: string;
  supplierName: string;
  supplierPhone?: string | null;
  supplierEmail?: string | null;
  totalAmount: number;
  printRef: RefObject<HTMLDivElement>;
  formatGNF: (amount: number) => string;
}

export function PurchaseOrderReceiptActions({
  showPrintButton,
  showShareButtons,
  orderNumber,
  supplierName,
  supplierPhone,
  supplierEmail,
  totalAmount,
  printRef,
  formatGNF
}: PurchaseOrderReceiptActionsProps) {
  // Ne pas utiliser de hooks à l'intérieur de conditions
  const handlePrint = useReactToPrint({
    documentTitle: `Bon de commande ${orderNumber}`,
    onAfterPrint: () => {
      console.log("Print completed");
      toast({
        title: "Impression terminée",
        description: "Le bon de commande a été envoyé à l'imprimante",
      });
    },
    contentRef: printRef,
  });

  const handleEmailShare = () => {
    if (!supplierEmail) {
      toast({
        variant: "destructive",
        title: "Erreur d'envoi",
        description: "L'adresse email du fournisseur n'est pas disponible",
      });
      return;
    }
    
    const subject = encodeURIComponent(`Bon de commande ${orderNumber}`);
    const body = encodeURIComponent(`Bon de commande ${orderNumber} pour ${supplierName} d'un montant de ${formatGNF(totalAmount)}`);
    window.open(`mailto:${supplierEmail}?subject=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Email préparé",
      description: "Votre application de messagerie a été ouverte",
    });
  };

  const handleWhatsAppShare = () => {
    if (!supplierPhone) {
      toast({
        variant: "destructive",
        title: "Erreur d'envoi",
        description: "Le numéro de téléphone du fournisseur n'est pas disponible",
      });
      return;
    }
    
    const phone = supplierPhone.replace(/\D/g, '');
    const text = encodeURIComponent(`Bon de commande ${orderNumber} pour ${supplierName} d'un montant de ${formatGNF(totalAmount)}`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    
    toast({
      title: "WhatsApp préparé",
      description: "L'application WhatsApp a été ouverte",
    });
  };

  const handleDownload = async () => {
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current, {
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
      pdf.save(`bon_commande_${orderNumber}.pdf`);
      
      toast({
        title: "Téléchargement réussi",
        description: "Le bon de commande a été téléchargé en format PDF",
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

  // Rendre null si aucun bouton n'est affiché
  if (!showPrintButton && !showShareButtons) {
    return null;
  }

  return (
    <div className="flex justify-end p-4 gap-2">
      {showPrintButton && (
        <Button 
          onClick={() => handlePrint()}  
          variant="outline"
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Imprimer
        </Button>
      )}
      
      {showShareButtons && (
        <>
          <Button 
            onClick={handleEmailShare}  
            variant="outline"
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
          
          <Button 
            onClick={handleWhatsAppShare}  
            variant="outline"
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            WhatsApp
          </Button>
          
          <Button 
            onClick={handleDownload}  
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Télécharger
          </Button>
        </>
      )}
    </div>
  );
}
