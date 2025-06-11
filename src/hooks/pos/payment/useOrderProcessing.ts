import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";
import { CartItem } from "@/types/pos";

export function useOrderProcessing(stockItems: any[], selectedPDV: string) {
  // Process the order (create or update)
  const processOrder = async (
    selectedClient: Client | null,
    cart: CartItem[],
    subtotal: number,
    totalDiscount: number,
    total: number,
    deliveryStatus: string,
    paidAmount: number,
    notes?: string,
    deliveredItems?: Record<string, { delivered: boolean, quantity: number }>,
    editOrderId?: string | null
  ) => {
    console.log('Processing order - starting...');
    
    let order;
    
    // If we're editing an existing order, update it
    if (editOrderId) {
      console.log('Updating existing order:', editOrderId);
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          client_id: selectedClient?.id,
          total: subtotal,
          discount: totalDiscount,
          final_total: total,
          status: 'completed',
          delivery_status: deliveryStatus,
          payment_status: paidAmount >= total ? 'paid' : 'partial',
          paid_amount: paidAmount,
          remaining_amount: total - paidAmount,
          comment: notes
        })
        .eq('id', editOrderId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating order:', updateError);
        throw updateError;
      }
      order = updatedOrder;
      
      // Delete existing order items to replace them with new ones
      const { error: deleteItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', editOrderId);
        
      if (deleteItemsError) {
        console.error('Error deleting order items:', deleteItemsError);
        throw deleteItemsError;
      }
    } else {
      // Create a new order without user_id since it's not in the schema
      console.log('Creating new order...');
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          client_id: selectedClient?.id,
          total: subtotal,
          discount: totalDiscount,
          final_total: total,
          status: 'completed',
          delivery_status: deliveryStatus,
          payment_status: paidAmount >= total ? 'paid' : 'partial',
          paid_amount: paidAmount,
          remaining_amount: total - paidAmount,
          comment: notes
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }
      order = newOrder;
      console.log('Order created successfully:', order.id);
    }

    // Calculate whether items are delivered or partially delivered
    const delivered = deliveryStatus === 'delivered';
    const partiallyDelivered = deliveryStatus === 'partial';

    // Create order items
    await createOrderItems(order.id, cart, deliveryStatus, delivered, partiallyDelivered, deliveredItems);
    
    // Update stock levels - CORRECTION CRITIQUE ICI
    await updateStockLevels(cart, selectedPDV);

    // Create sales invoice automatically
    await createSalesInvoice(order, selectedClient, cart, subtotal, totalDiscount, total, paidAmount, deliveryStatus);

    console.log('Order processing completed successfully');

    // Return the order object with all necessary information
    return {
      id: order.id,
      client: selectedClient,
      items: cart,
      subtotal,
      total_discount: totalDiscount,
      final_total: total,
      payment_status: order.payment_status,
      delivery_status: deliveryStatus,
      paid_amount: paidAmount,
      remaining_amount: order.remaining_amount,
      // Include any other properties needed for the invoice
    };
  };

  // Helper to create sales invoice
  const createSalesInvoice = async (
    order: any,
    client: Client | null,
    cart: CartItem[],
    subtotal: number,
    totalDiscount: number,
    total: number,
    paidAmount: number,
    deliveryStatus: string
  ) => {
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    console.log('Creating sales invoice:', invoiceNumber);
    
    // Create sales invoice without user_id since it's not in the schema
    const { data: salesInvoice, error: salesInvoiceError } = await supabase
      .from('sales_invoices')
      .insert({
        order_id: order.id,
        client_id: client?.id,
        invoice_number: invoiceNumber,
        total_amount: total,
        paid_amount: paidAmount,
        remaining_amount: total - paidAmount,
        payment_status: paidAmount >= total ? 'paid' : paidAmount > 0 ? 'partial' : 'pending',
        delivery_status: deliveryStatus
      })
      .select()
      .single();

    if (salesInvoiceError) {
      console.error('Error creating sales invoice:', salesInvoiceError);
      throw salesInvoiceError;
    }

    // Create sales invoice items
    const salesInvoiceItems = cart.map(item => {
      let deliveredQuantity = 0;
      
      if (deliveryStatus === 'delivered') {
        deliveredQuantity = item.quantity;
      } else if (deliveryStatus === 'partial') {
        deliveredQuantity = Math.floor(item.quantity / 2); // Simplified logic
      }

      return {
        sales_invoice_id: salesInvoice.id,
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
      .insert(salesInvoiceItems);

    if (itemsError) {
      console.error('Error creating sales invoice items:', itemsError);
      throw itemsError;
    }

    console.log('Sales invoice created successfully:', salesInvoice.invoice_number);
  };

  // Helper to create order items
  const createOrderItems = async (
    orderId: string, 
    cart: CartItem[], 
    deliveryStatus: string,
    delivered: boolean,
    partiallyDelivered: boolean,
    deliveredItems?: Record<string, { delivered: boolean, quantity: number }>
  ) => {
    console.log('Creating order items for order:', orderId);
    
    const orderItems = cart.map(item => {
      let deliveredQuantity = 0;
      
      if (delivered) {
        deliveredQuantity = item.quantity;
      } else if (partiallyDelivered && deliveredItems && deliveredItems[item.id]) {
        deliveredQuantity = deliveredItems[item.id].quantity;
      }
        
      return {
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
        total: (item.price * item.quantity) - ((item.discount || 0) * item.quantity),
        delivered_quantity: deliveredQuantity
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw itemsError;
    }
    
    console.log('Order items created successfully');
  };

  // Helper to update stock levels - FONCTION CORRIGÉE
  const updateStockLevels = async (cart: CartItem[], selectedPDV: string) => {
    console.log('Updating stock levels for PDV:', selectedPDV);
    console.log('Cart items:', cart);
    
    for (const item of cart) {
      console.log(`Processing stock update for product ${item.id}, quantity: ${item.quantity}`);
      
      try {
        // Récupérer le stock actuel pour ce produit et ce PDV
        const { data: currentStock, error: fetchError } = await supabase
          .from('warehouse_stock')
          .select('*')
          .eq('product_id', item.id)
          .eq('pos_location_id', selectedPDV)
          .single();

        if (fetchError) {
          console.error(`Error fetching stock for product ${item.id}:`, fetchError);
          continue; // Passer au produit suivant en cas d'erreur
        }

        if (currentStock) {
          const newQuantity = Math.max(0, currentStock.quantity - item.quantity);
          const newTotalValue = newQuantity * currentStock.unit_price;
          
          console.log(`Updating stock: ${currentStock.quantity} -> ${newQuantity}`);
          
          // Mettre à jour le stock
          const { error: updateError } = await supabase
            .from('warehouse_stock')
            .update({
              quantity: newQuantity,
              total_value: newTotalValue,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentStock.id);
          
          if (updateError) {
            console.error(`Error updating stock for product ${item.id}:`, updateError);
          } else {
            console.log(`Stock updated successfully for product ${item.id}`);
          }
        } else {
          console.warn(`No stock found for product ${item.id} at POS location ${selectedPDV}`);
        }
      } catch (error) {
        console.error(`Exception while updating stock for product ${item.id}:`, error);
      }
    }
    
    console.log('Stock levels update completed');
  };

  return { processOrder };
}
