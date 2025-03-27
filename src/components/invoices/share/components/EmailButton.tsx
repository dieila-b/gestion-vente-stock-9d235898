
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useEmailShare } from "../utils/useEmailShare";

interface EmailButtonProps {
  clientEmail?: string;
  invoiceNumber: string;
  clientName: string;
  totalAmount: number;
  formatGNF: (amount: number) => string;
}

export function EmailButton({ clientEmail, invoiceNumber, clientName, totalAmount, formatGNF }: EmailButtonProps) {
  const { sendEmail } = useEmailShare();
  
  return (
    <Button
      variant="outline"
      onClick={() => sendEmail(clientEmail, invoiceNumber, clientName, totalAmount, formatGNF)}
      className="flex items-center gap-2"
      disabled={!clientEmail}
    >
      <Mail className="h-4 w-4" />
      Email
    </Button>
  );
}
