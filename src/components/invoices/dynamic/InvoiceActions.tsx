
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Mail, Download, Plus, MessageSquare } from 'lucide-react';

interface InvoiceActionsProps {
  onSendEmail?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  onAddPayment?: () => void;
  onWhatsApp?: () => void;
}

export const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  onSendEmail,
  onDownload,
  onPrint,
  onAddPayment,
  onWhatsApp
}) => {
  return (
    <div className="p-6 border-t border-gray-200 flex flex-wrap gap-2 justify-center">
      {onPrint && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={onPrint}
        >
          <Printer className="h-4 w-4" />
          Imprimer
        </Button>
      )}
      
      {onSendEmail && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={onSendEmail}
        >
          <Mail className="h-4 w-4" />
          Email
        </Button>
      )}
      
      {onWhatsApp && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={onWhatsApp}
        >
          <MessageSquare className="h-4 w-4" />
          WhatsApp
        </Button>
      )}
      
      {onDownload && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={onDownload}
        >
          <Download className="h-4 w-4" />
          Télécharger
        </Button>
      )}
      
      {onAddPayment && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={onAddPayment}
        >
          <Plus className="h-4 w-4" />
          Ajouter paiement
        </Button>
      )}
    </div>
  );
};
