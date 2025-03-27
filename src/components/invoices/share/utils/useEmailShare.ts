
import { toast } from 'sonner';

export function useEmailShare() {
  // Send invoice by email
  const sendEmail = (clientEmail: string | undefined, invoiceNumber: string, clientName: string, totalAmount: number, formatGNF: (amount: number) => string) => {
    if (!clientEmail) {
      toast.error("Adresse email du client non disponible");
      return;
    }

    const subject = `Facture ${invoiceNumber} - ${clientName}`;
    const body = `Bonjour,\n\nVeuillez trouver ci-joint votre facture ${invoiceNumber} d'un montant de ${formatGNF(totalAmount)}.\n\nCordialement,\nVotre équipe`;
    
    window.location.href = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success("Préparation de l'email en cours");
  };

  return { sendEmail };
}
