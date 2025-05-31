
import { Client } from "@/types/client";
import { CartItem } from "@/types/pos";
import { createOrder, updateOrder } from "./services/orderService";
import { createOrderItems, deleteExistingOrderItems } from "./services/orderItemsService";
import { updateStockLevels } from "./services/stockService";
import { createSalesInvoice } from "./services/salesInvoiceService";

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
    let order;
    
    // If we're editing an existing order, update it
    if (editOrderId) {
      order = await updateOrder(
        editOrderId,
        selectedClient,
        subtotal,
        totalDiscount,
        total,
        deliveryStatus,
        paidAmount,
        notes
      );
      
      // Delete existing order items to replace them with new ones
      await deleteExistingOrderItems(editOrderId);
    } else {
      // Create a new order
      order = await createOrder(
        selectedClient,
        subtotal,
        totalDiscount,
        total,
        deliveryStatus,
        paidAmount,
        notes
      );
    }

    // Create order items
    await createOrderItems(order.id, cart, deliveryStatus, deliveredItems);
    
    // Update stock levels
    await updateStockLevels(cart, stockItems, selectedPDV);

    // Create sales invoice automatically
    await createSalesInvoice(order, selectedClient, cart, deliveryStatus, deliveredItems);

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
    };
  };

  return { processOrder };
}
