
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PurchaseInvoice } from "@/types/purchase-invoice";
import { PurchaseOrderItem } from "@/types/purchase-order";
import { usePurchaseItems } from "./edit/use-purchase-items";

export function usePurchaseInvoice(invoiceId?: string) {
  const [invoiceItems, setInvoiceItems] = useState<PurchaseOrderItem[]>([]);
  
  // Fetch invoice data
  const { data: invoice, isLoading: isInvoiceLoading } = useQuery<PurchaseInvoice | null>({
    queryKey: ['purchase-invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      
      const { data, error } = await supabase
        .from('purchase_invoices')
        .select(`
          *,
          supplier:suppliers(*),
          purchase_order:purchase_orders(*)
        `)
        .eq('id', invoiceId)
        .maybeSingle();
        
      if (error) {
        toast.error(`Erreur lors du chargement de la facture: ${error.message}`);
        throw error;
      }
      
      return data as PurchaseInvoice;
    },
    enabled: !!invoiceId
  });

  // Get purchase order items if a purchase order is associated
  const { getPurchaseOrderItems } = usePurchaseItems(
    undefined,
    [],
    () => {},
    async () => {}
  );

  // Fetch items from the associated purchase order
  const { isLoading: isItemsLoading } = useQuery({
    queryKey: ['purchase-invoice-items', invoice?.purchase_order?.id],
    queryFn: async () => {
      if (!invoice?.purchase_order?.id) return [];
      
      const items = await getPurchaseOrderItems(invoice.purchase_order.id);
      setInvoiceItems(items);
      return items;
    },
    enabled: !!invoice?.purchase_order?.id
  });

  return {
    invoice,
    invoiceItems,
    isLoading: isInvoiceLoading || isItemsLoading
  };
}
