
import { InvoiceDisplay } from "./InvoiceDisplay";
import { Button } from "@/components/ui/button";
import { FileText, Receipt } from "lucide-react";
import { useRef, useState } from "react";
import { usePrintInvoice } from "@/components/invoices/share/utils/usePrintInvoice";

interface CartItemInfo {
  id: string;
  name: string;
  quantity: number;
}

interface InvoiceCompletionStatusProps {
  paymentComplete: boolean;
  isAlreadyPaid: boolean;
  generatedInvoiceNumber: string;
  items: CartItemInfo[];
  totalAmount: number;
  amount: number;
  client?: any;
  onClose: () => void;
  paymentStatus: 'paid' | 'partial' | 'pending';
  deliveryStatus: 'delivered' | 'partial' | 'awaiting';
  remainingAmount: number;
}

export function InvoiceCompletionStatus({
  paymentComplete,
  isAlreadyPaid,
  generatedInvoiceNumber,
  items,
  totalAmount,
  amount,
  client,
  onClose,
  paymentStatus,
  deliveryStatus,
  remainingAmount
}: InvoiceCompletionStatusProps) {
  const [selectedFormat, setSelectedFormat] = useState<'invoice' | 'receipt' | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { handlePrint } = usePrintInvoice();

  // If not showing completion screen, return null
  if (!paymentComplete || isAlreadyPaid) {
    return null;
  }

  // If user hasn't selected a format yet, show format options
  if (!selectedFormat) {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">Paiement réussi!</h2>
          <p className="text-muted-foreground">Veuillez choisir le format d'impression</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => setSelectedFormat('invoice')} 
            variant="outline" 
            className="flex flex-col items-center justify-center h-28 border-2 hover:bg-gray-100 hover:border-primary"
          >
            <FileText className="h-8 w-8 mb-2" />
            <span className="font-medium">Facture complète</span>
            <span className="text-xs text-muted-foreground">Format détaillé</span>
          </Button>
          
          <Button 
            onClick={() => setSelectedFormat('receipt')} 
            variant="outline" 
            className="flex flex-col items-center justify-center h-28 border-2 hover:bg-gray-100 hover:border-primary"
          >
            <Receipt className="h-8 w-8 mb-2" />
            <span className="font-medium">Reçu simplifié</span>
            <span className="text-xs text-muted-foreground">Format compact</span>
          </Button>
        </div>
        
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={onClose}>
            Fermer sans imprimer
          </Button>
        </div>
      </div>
    );
  }

  // If format is selected, show the corresponding view
  return (
    <div>
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setSelectedFormat(null)}
          className="mb-4"
        >
          Retour aux options
        </Button>
      </div>
      
      <div ref={invoiceRef}>
        <InvoiceDisplay 
          invoiceNumber={generatedInvoiceNumber}
          items={items}
          totalAmount={totalAmount}
          amount={amount}
          client={client}
          onClose={onClose}
          paymentStatus={paymentStatus}
          deliveryStatus={deliveryStatus}
          paidAmount={amount}
          remainingAmount={remainingAmount}
          isReceipt={selectedFormat === 'receipt'}
        />
      </div>
      
      <div className="flex justify-between mt-4">
        <Button 
          onClick={() => handlePrint(invoiceRef, generatedInvoiceNumber, undefined, selectedFormat === 'receipt')}
          className="bg-green-600 hover:bg-green-700"
        >
          Imprimer {selectedFormat === 'receipt' ? 'le reçu' : 'la facture'}
        </Button>
        
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  );
}
