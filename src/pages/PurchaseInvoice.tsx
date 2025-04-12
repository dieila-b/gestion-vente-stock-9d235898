import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PurchaseInvoice } from "@/types/PurchaseInvoice";
import { supabase } from "@/integrations/supabase/client";

function PurchaseInvoicePage() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
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

      // Add missing state variables for error fixes
      const [isCreating, setIsCreating] = useState(false);
      const [isVisible, setIsVisible] = useState(false);
      const [isUpdating, setIsUpdating] = useState(false);

      // When mapping data to PurchaseInvoice type, add the required properties:
      const mappedInvoices = data.map(invoice => ({
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
          name: invoice.supplier?.name || 'Unknown Supplier',
          phone: invoice.supplier?.phone || '',
          email: invoice.supplier?.email || ''
        },
        purchase_order: {
          id: invoice.purchase_order?.id || '',
          order_number: invoice.purchase_order?.order_number || ''
        },
        delivery_note: {
          id: invoice.delivery_note?.id || '',
          delivery_number: invoice.delivery_note?.delivery_number || ''
        }
      })) as PurchaseInvoice[];

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
