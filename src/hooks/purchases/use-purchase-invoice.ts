
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PurchaseInvoice } from "@/types/purchase-invoice";
import { PurchaseOrderItem } from "@/types/purchase-order";
import { usePurchaseItems } from "./edit/use-purchase-items";
import { isSelectQueryError } from "@/utils/type-utils";

export function usePurchaseInvoice(invoiceId?: string) {
  const [invoiceItems, setInvoiceItems] = useState<PurchaseOrderItem[]>([]);
  
  // Fetch invoice data
  const { data: invoice, isLoading: isInvoiceLoading } = useQuery<PurchaseInvoice | null>({
    queryKey: ['purchase-invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      
      try {
        const { data, error } = await supabase
          .from('purchase_invoices')
          .select(`
            id,
            invoice_number,
            supplier_id,
            total_amount,
            status,
            created_at,
            updated_at,
            payment_status,
            due_date,
            paid_amount,
            remaining_amount,
            discount,
            notes,
            shipping_cost,
            supplier:suppliers(id, name, email, phone),
            purchase_order:purchase_orders(id, order_number, created_at)
          `)
          .eq('id', invoiceId)
          .maybeSingle();
          
        if (error) {
          toast.error(`Erreur lors du chargement de la facture: ${error.message}`);
          throw error;
        }
        
        if (!data) {
          return null;
        }
        
        // Check if data is a SelectQueryError before accessing properties
        if (isSelectQueryError(data)) {
          console.error("Query error:", data);
          toast.error("Erreur de structure dans les données de la facture");
          return {
            id: '',
            invoice_number: '',
            supplier_id: '',
            total_amount: 0,
            status: 'error',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tax_amount: 0,
            payment_status: 'pending',
            due_date: '',
            paid_amount: 0,
            remaining_amount: 0,
            discount: 0,
            notes: '',
            shipping_cost: 0,
            supplier: { id: '', name: 'Fournisseur inconnu', phone: '', email: '' },
            purchase_order: { id: '', order_number: '', created_at: '' }
          } as PurchaseInvoice;
        }
        
        // Return the data with default values for any missing fields
        return {
          id: data.id,
          invoice_number: data.invoice_number,
          supplier_id: data.supplier_id,
          total_amount: data.total_amount,
          status: data.status,
          created_at: data.created_at,
          updated_at: data.updated_at,
          tax_amount: 0, // Default value since this column doesn't exist
          payment_status: data.payment_status || 'pending',
          due_date: data.due_date || '',
          paid_amount: data.paid_amount || 0,
          remaining_amount: data.remaining_amount || 0,
          discount: data.discount || 0,
          notes: data.notes || '',
          shipping_cost: data.shipping_cost || 0,
          supplier: isSelectQueryError(data.supplier) ? 
            { id: '', name: 'Fournisseur inconnu', phone: '', email: '' } : data.supplier,
          purchase_order: isSelectQueryError(data.purchase_order) ? 
            { id: '', order_number: '', created_at: '' } : data.purchase_order,
        } as PurchaseInvoice;
      } catch (error) {
        console.error("Error fetching purchase invoice:", error);
        toast.error("Impossible de charger la facture");
        return null;
      }
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
      
      try {
        const items = await getPurchaseOrderItems(invoice.purchase_order.id);
        setInvoiceItems(items);
        return items;
      } catch (error) {
        console.error("Error fetching purchase order items:", error);
        return [];
      }
    },
    enabled: !!invoice?.purchase_order?.id
  });

  return {
    invoice,
    invoiceItems,
    isLoading: isInvoiceLoading || isItemsLoading
  };
}
