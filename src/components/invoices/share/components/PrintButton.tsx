
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { RefObject } from "react";
import { usePrintInvoice } from "../utils/usePrintInvoice";

interface PrintButtonProps {
  invoiceRef: RefObject<HTMLDivElement>;
  invoiceNumber: string;
  onPrint?: () => void;
}

export function PrintButton({ invoiceRef, invoiceNumber, onPrint }: PrintButtonProps) {
  const { handlePrint } = usePrintInvoice();
  
  return (
    <Button 
      variant="outline" 
      onClick={() => handlePrint(invoiceRef, invoiceNumber, onPrint)}
      className="flex items-center gap-2"
    >
      <Printer className="h-4 w-4" />
      Imprimer
    </Button>
  );
}
