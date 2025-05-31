
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";
import { CartItem } from "@/types/pos";

export const createSalesInvoice = async (
  order: any,
  client: Client | null,
  cart: CartItem[],
  deliveryStatus: string,
  deliveredItems?: Record<string, { delivered: boolean, quantity: number }>
) => {
  try {
    // Generate invoice number
    const invoiceNumber = `FAV-${Date.now().toString().slice(-8)}`;
    
    // Create the sales invoice - use any type to bypass TypeScript errors
    const { data: invoice, error: invoiceError } = await (supabase as any)
      .from('sales_invoices')
      .insert({
        invoice_number: invoiceNumber,
        order_id: order.id,
        client_id: client?.id,
        total_amount: order.final_total,
        paid_amount: order.paid_amount,
        remaining_amount: order.remaining_amount,
        payment_status: order.payment_status,
        delivery_status: deliveryStatus,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating sales invoice:', invoiceError);
      return;
    }

    // Create invoice items
    const invoiceItems = cart.map(item => {
      let deliveredQuantity = 0;
      
      if (deliveryStatus === 'delivered') {
        deliveredQuantity = item.quantity;
      } else if (deliveryStatus === 'partial' && deliveredItems && deliveredItems[item.id]) {
        deliveredQuantity = deliveredItems[item.id].quantity;
      }

      return {
        sales_invoice_id: invoice.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        discount: item.discount || 0,
        total_price: (item.price * item.quantity) - ((item.discount || 0) * item.quantity),
        delivered_quantity: deliveredQuantity
      };
    });

    const { error: itemsError } = await (supabase as any)
      .from('sales_invoice_items')
      .insert(invoiceItems);

    if (itemsError) {
      console.error('Error creating sales invoice items:', itemsError);
    }

    console.log(`Sales invoice ${invoiceNumber} created successfully for order ${order.id}`);
  } catch (error) {
    console.error('Error in createSalesInvoice:', error);
  }
};
