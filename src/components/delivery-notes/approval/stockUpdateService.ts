
import { supabase } from "@/integrations/supabase/client";
import { DeliveryNote } from "@/types/delivery-note";
import { toast } from "sonner";

interface ReceivedQuantity {
  id: string;
  quantity_received: number;
}

export const stockUpdateService = {
  async approveDeliveryNote(
    note: DeliveryNote,
    receivedQuantities: Record<string, number>,
    selectedLocationId: string,
    warehouses: any[],
    posLocations: any[]
  ) {
    // 1. Update delivery note items with received quantities
    const updates = note.items.map(item => ({
      id: item.id,
      quantity_received: receivedQuantities[item.id] || 0
    }));

    // Update each delivery note item
    for (const update of updates) {
      const { error } = await supabase
        .from('delivery_note_items')
        .update({ quantity_received: update.quantity_received })
        .eq('id', update.id);
      
      if (error) throw error;
    }

    // 2. Update stocks for each received item
    for (const item of note.items) {
      const receivedQty = receivedQuantities[item.id] || 0;
      if (receivedQty > 0) {
        await this.updateStockForLocation(
          item.product_id,
          receivedQty,
          item.unit_price,
          selectedLocationId,
          warehouses,
          posLocations,
          note.delivery_number
        );
      }
    }

    // 3. Update delivery note status to 'received'
    const { error: noteError } = await supabase
      .from('delivery_notes')
      .update({ 
        status: 'received',
        warehouse_id: selectedLocationId,
        updated_at: new Date().toISOString()
      })
      .eq('id', note.id);
    
    if (noteError) throw noteError;

    // 4. Create purchase invoice from approved delivery note
    await this.createPurchaseInvoice(note, updates);
  },

  async updateStockForLocation(
    productId: string,
    quantity: number,
    unitPrice: number,
    selectedLocationId: string,
    warehouses: any[],
    posLocations: any[],
    deliveryNumber: string
  ) {
    if (quantity <= 0) return;

    try {
      // Determine location type
      const isWarehouse = warehouses.some(w => w.id === selectedLocationId);
      
      // 1. Create stock movement
      const movementData: any = {
        product_id: productId,
        quantity: quantity,
        unit_price: unitPrice,
        total_value: quantity * unitPrice,
        type: 'in',
        reason: `Réception bon de livraison ${deliveryNumber}`
      };

      if (isWarehouse) {
        movementData.warehouse_id = selectedLocationId;
      } else {
        // For POS, use default warehouse since FK only accepts warehouses
        const defaultWarehouse = warehouses[0];
        if (defaultWarehouse) {
          movementData.warehouse_id = defaultWarehouse.id;
          movementData.reason = `${movementData.reason} (PDV: ${posLocations.find(p => p.id === selectedLocationId)?.name || 'PDV'})`;
        }
      }

      const { error: movementError } = await supabase
        .from('warehouse_stock_movements')
        .insert(movementData);

      if (movementError) throw movementError;

      // 2. Update warehouse_stock
      const stockQuery = supabase
        .from('warehouse_stock')
        .select('id, quantity, unit_price, total_value')
        .eq('product_id', productId);

      if (isWarehouse) {
        stockQuery.eq('warehouse_id', selectedLocationId).is('pos_location_id', null);
      } else {
        stockQuery.eq('pos_location_id', selectedLocationId).is('warehouse_id', null);
      }

      const { data: existingStock, error: stockCheckError } = await stockQuery.maybeSingle();

      if (stockCheckError) throw stockCheckError;

      if (existingStock) {
        // Update with weighted average price calculation
        const newQuantity = existingStock.quantity + quantity;
        const oldValue = existingStock.quantity * existingStock.unit_price;
        const newValue = quantity * unitPrice;
        const newTotalValue = oldValue + newValue;
        const newUnitPrice = newQuantity > 0 ? newTotalValue / newQuantity : unitPrice;

        const { error: updateError } = await supabase
          .from('warehouse_stock')
          .update({
            quantity: newQuantity,
            unit_price: newUnitPrice,
            total_value: newTotalValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingStock.id);

        if (updateError) throw updateError;
      } else {
        // Create new entry
        const stockData: any = {
          product_id: productId,
          quantity: quantity,
          unit_price: unitPrice,
          total_value: quantity * unitPrice
        };

        if (isWarehouse) {
          stockData.warehouse_id = selectedLocationId;
          stockData.pos_location_id = null;
        } else {
          stockData.pos_location_id = selectedLocationId;
          stockData.warehouse_id = null;
        }

        const { error: insertError } = await supabase
          .from('warehouse_stock')
          .insert(stockData);

        if (insertError) throw insertError;
      }

      // 3. Update catalog stock
      const { data: productData, error: productError } = await supabase
        .from('catalog')
        .select('stock')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      const newCatalogStock = (productData?.stock || 0) + quantity;
      const { error: catalogUpdateError } = await supabase
        .from('catalog')
        .update({ 
          stock: newCatalogStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (catalogUpdateError) throw catalogUpdateError;

    } catch (error: any) {
      console.error('Stock update error:', error);
      throw new Error(`Erreur lors de la mise à jour du stock: ${error.message}`);
    }
  },

  async createPurchaseInvoice(deliveryNote: DeliveryNote, receivedItems: ReceivedQuantity[]) {
    try {
      // Generate invoice number
      const invoiceNumber = `FA-${Date.now()}`;
      
      // Calculate total amount based on received quantities
      let totalAmount = 0;
      receivedItems.forEach(receivedItem => {
        const originalItem = deliveryNote.items.find(item => item.id === receivedItem.id);
        if (originalItem) {
          totalAmount += receivedItem.quantity_received * originalItem.unit_price;
        }
      });

      // Create purchase invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('purchase_invoices')
        .insert({
          invoice_number: invoiceNumber,
          supplier_id: deliveryNote.supplier_id,
          total_amount: totalAmount,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      console.log('Purchase invoice created:', invoice);
    } catch (error: any) {
      console.error('Error creating purchase invoice:', error);
      // Don't throw here to avoid blocking the approval process
      toast.warning("Bon de livraison approuvé mais erreur lors de la création de la facture");
    }
  }
};
