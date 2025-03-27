
import { CartItem } from "@/types/pos";
import { Client } from "@/types/client";
import { generateInvoiceHTML } from "./generators/invoiceGenerator";
import { getDeliveryStatusLabel } from "./utils/deliveryStatus";

/**
 * Hook for generating invoice templates
 */
export function useInvoiceTemplate() {
  return { 
    generateInvoiceHTML,
    getDeliveryStatusLabel
  };
}
