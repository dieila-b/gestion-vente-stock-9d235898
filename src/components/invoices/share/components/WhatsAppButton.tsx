
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { RefObject } from "react";
import { useWhatsAppShare } from "../utils/useWhatsAppShare";
import { usePdfGenerator } from "../utils/usePdfGenerator";

interface WhatsAppButtonProps {
  clientPhone?: string;
  invoiceRef: RefObject<HTMLDivElement>;
  invoiceNumber: string;
  totalAmount: number;
  formatGNF: (amount: number) => string;
}

export function WhatsAppButton({ clientPhone, invoiceRef, invoiceNumber, totalAmount, formatGNF }: WhatsAppButtonProps) {
  const { sendWhatsApp } = useWhatsAppShare();
  const { isGeneratingPDF } = usePdfGenerator();
  
  return (
    <Button
      variant="outline"
      onClick={() => sendWhatsApp(clientPhone, invoiceRef, invoiceNumber, totalAmount, formatGNF)}
      className="flex items-center gap-2"
      disabled={!clientPhone || isGeneratingPDF}
    >
      <MessageSquare className="h-4 w-4" />
      WhatsApp
      {isGeneratingPDF && "..."}
    </Button>
  );
}
