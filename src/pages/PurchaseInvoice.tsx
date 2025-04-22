
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { isSelectQueryError } from "@/utils/type-utils";

// Update PurchaseInvoice interface to match expected structure
interface PurchaseInvoice {
  id: string;
  invoice_number: string;
  supplier_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  // Add all the required properties for compatibility
  tax_amount: number;
  payment_status: string;
  due_date: string;
  paid_amount: number;
  remaining_amount: number;
  discount: number;
  notes: string;
  shipping_cost: number;
  supplier?: {
    name: string;
    phone?: string;
    email?: string;
  };
  purchase_order?: {
    id: string;
    order_number: string;
  };
  delivery_note?: {
    id: string;
    delivery_number: string;
  };
}

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

      // When mapping data to PurchaseInvoice type, provide defaults for required properties:
      const mappedInvoices = data.map(invoice => {
        // Create a safe supplier object
        const safeSupplier = isSelectQueryError(invoice.supplier) 
          ? { name: 'Supplier not found', phone: '', email: '' }
          : invoice.supplier || { name: 'Supplier not found', phone: '', email: '' };
          
        // Create a safe purchase order object
        const safePurchaseOrder = isSelectQueryError(invoice.purchase_order)
          ? { id: '', order_number: 'Order not found' }
          : invoice.purchase_order || { id: '', order_number: 'Order not found' };
          
        // Create a safe delivery note object
        const safeDeliveryNote = isSelectQueryError(invoice.delivery_note)
          ? { id: '', delivery_number: 'Delivery note not found' }
          : invoice.delivery_note || { id: '', delivery_number: 'Delivery note not found' };

        return {
          ...invoice,
          tax_amount: 0, // Default values for required fields
          payment_status: 'pending',
          due_date: new Date().toISOString(),
          paid_amount: 0,
          remaining_amount: invoice.total_amount || 0,
          discount: 0,
          notes: '',
          shipping_cost: 0,
          supplier: safeSupplier,
          purchase_order: safePurchaseOrder,
          delivery_note: safeDeliveryNote
        } as PurchaseInvoice;
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
