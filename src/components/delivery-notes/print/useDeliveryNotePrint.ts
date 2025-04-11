
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from "@/components/ui/use-toast";
import { DeliveryNote } from "@/types/delivery-note";

export function useDeliveryNotePrint(note: DeliveryNote | null) {
  const printRef = useRef<HTMLDivElement>(null);
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    if (!note) return 0;
    
    return note.items.reduce((total, item) => {
      const itemPrice = item.unit_price || 0;
      const quantity = item.expected_quantity || item.quantity_ordered || 0;
      return total + (itemPrice * quantity);
    }, 0);
  };

  // Handle print using react-to-print
  const handlePrint = useReactToPrint({
    documentTitle: note ? `Bon de livraison ${note.delivery_number}` : 'Bon de livraison',
    onAfterPrint: () => {
      toast({
        title: "Impression terminée",
        description: "Le bon de livraison a été envoyé à l'imprimante",
      });
    },
    contentRef: printRef,
  });
  
  return {
    printRef,
    calculateSubtotal,
    handlePrint
  };
}
