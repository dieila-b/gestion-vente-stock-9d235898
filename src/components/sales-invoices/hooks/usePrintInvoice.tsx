
import { useInvoicePrinter } from "./printing/useInvoicePrinter";

export function usePrintInvoice() {
  // Simply re-export the refactored functionality
  return useInvoicePrinter();
}
