
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { RefObject } from "react";
import { useDownloadPdf } from "../utils/useDownloadPdf";
import { usePdfGenerator } from "../utils/usePdfGenerator";

interface DownloadButtonProps {
  invoiceRef: RefObject<HTMLDivElement>;
  invoiceNumber: string;
}

export function DownloadButton({ invoiceRef, invoiceNumber }: DownloadButtonProps) {
  const { downloadPdf } = useDownloadPdf();
  const { isGeneratingPDF } = usePdfGenerator();
  
  return (
    <Button
      variant="outline"
      onClick={() => downloadPdf(invoiceRef, invoiceNumber)}
      className="flex items-center gap-2"
      disabled={isGeneratingPDF}
    >
      <Download className="h-4 w-4" />
      Télécharger
      {isGeneratingPDF && "..."}
    </Button>
  );
}
