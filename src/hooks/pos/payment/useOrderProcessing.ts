
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
    console.log('processOrder: Début du traitement de la commande', {
      editOrderId,
      cartLength: cart.length,
      total,
      paidAmount,
      deliveryStatus
    });

    let order;
    
    try {
      // If we're editing an existing order, update it
      if (editOrderId) {
        console.log('processOrder: Mise à jour de la commande existante', editOrderId);
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
        console.log('processOrder: Création d\'une nouvelle commande');
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

      console.log('processOrder: Commande créée/mise à jour:', order);

      // Create order items
      console.log('processOrder: Création des articles de commande');
      await createOrderItems(order.id, cart, deliveryStatus, deliveredItems);
      
      // Update stock levels
      console.log('processOrder: Mise à jour des niveaux de stock');
      await updateStockLevels(cart, stockItems, selectedPDV);

      // Create sales invoice automatically
      console.log('processOrder: Création de la facture de vente');
      const invoice = await createSalesInvoice(order, selectedClient, cart, deliveryStatus, deliveredItems);
      console.log('processOrder: Facture de vente créée:', invoice);

      // Return the order object with all necessary information
      const result = {
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
        invoice: invoice
      };

      console.log('processOrder: Résultat final:', result);
      return result;
    } catch (error) {
      console.error('processOrder: Erreur lors du traitement:', error);
      throw error;
    }
  };

  return { processOrder };
}
