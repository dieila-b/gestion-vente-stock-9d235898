
import { toast } from "sonner";

export function usePrintWindow() {
  const openPrintWindow = (content: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Impossible d'ouvrir la fenêtre d'impression");
      return;
    }

    printWindow.document.write(content);
    printWindow.document.close();
  };

  return { openPrintWindow };
}
