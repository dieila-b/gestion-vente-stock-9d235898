
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
    console.log('createSalesInvoice: Début de la création de la facture', {
      orderId: order.id,
      clientId: client?.id,
      cartLength: cart.length,
      deliveryStatus
    });

    // Generate invoice number
    const invoiceNumber = `FAV-${Date.now().toString().slice(-8)}`;
    
    // Create the sales invoice
    const { data: invoice, error: invoiceError } = await supabase
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
      console.error('Erreur lors de la création de la facture de vente:', invoiceError);
      throw invoiceError;
    }

    console.log('Facture de vente créée avec succès:', invoice);

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

    const { error: itemsError } = await supabase
      .from('sales_invoice_items')
      .insert(invoiceItems);

    if (itemsError) {
      console.error('Erreur lors de la création des articles de la facture:', itemsError);
      throw itemsError;
    }

    console.log(`Facture de vente ${invoiceNumber} créée avec succès pour la commande ${order.id}`);
    return invoice;
  } catch (error) {
    console.error('Erreur dans createSalesInvoice:', error);
    throw error;
  }
};
