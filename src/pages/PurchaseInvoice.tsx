
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { isSelectQueryError, safeSupplier, safePurchaseOrder, safeDeliveryNote } from "@/utils/type-utils";
import { PurchaseInvoice } from "@/types/PurchaseInvoice";

// Extend the PurchaseInvoice type to include the missing properties
interface ExtendedPurchaseInvoice extends PurchaseInvoice {
  tax_amount?: number;
  payment_status?: string;
  due_date?: string;
  paid_amount?: number;
  remaining_amount?: number;
  discount?: number;
  notes?: string;
  shipping_cost?: number;
}

function PurchaseInvoicePage() {
  const [invoices, setInvoices] = useState<ExtendedPurchaseInvoice[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_invoices')
        .select(`
          *,
          supplier:suppliers (
            id,
            name,
            phone,
            email
          ),
          purchase_order:purchase_orders (
            id,
            order_number
          ),
          delivery_note:delivery_notes (
            id,
            delivery_number
          )
        `);

      if (error) {
        console.error("Error fetching invoices:", error);
        return;
      }

      if (!data) {
        console.warn("No invoices found.");
        return;
      }

      // When mapping data to PurchaseInvoice type, add the required properties:
      const mappedInvoices = data.map(invoice => {
        // Handle relations that could be SelectQueryError
        const safeSupplierData = safeSupplier(invoice.supplier);
        const safePurchaseOrderData = safePurchaseOrder(invoice.purchase_order);
        const safeDeliveryNoteData = safeDeliveryNote(invoice.delivery_note);

        return {
          ...invoice,
          tax_amount: invoice.tax_amount || 0,
          payment_status: invoice.payment_status || 'pending',
          due_date: invoice.due_date || new Date().toISOString(),
          paid_amount: invoice.paid_amount || 0,
          remaining_amount: invoice.total_amount - (invoice.paid_amount || 0),
          discount: invoice.discount || 0,
          notes: invoice.notes || '',
          shipping_cost: invoice.shipping_cost || 0,
          supplier: {
            name: safeSupplierData.name,
            phone: safeSupplierData.phone,
            email: safeSupplierData.email
          },
          purchase_order: {
            id: safePurchaseOrderData.id,
            order_number: safePurchaseOrderData.order_number
          },
          delivery_note: {
            id: safeDeliveryNoteData.id,
            delivery_number: safeDeliveryNoteData.delivery_number
          }
        } as ExtendedPurchaseInvoice;
      });

      setInvoices(mappedInvoices);
    } catch (error) {
      console.error("Error processing invoices:", error);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Purchase Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.map(invoice => (
            <div key={invoice.id}>
              Invoice Number: {invoice.invoice_number}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default PurchaseInvoicePage;
