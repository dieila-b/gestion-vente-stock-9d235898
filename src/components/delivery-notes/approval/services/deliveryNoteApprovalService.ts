
import { supabase } from "@/integrations/supabase/client";
import { DeliveryNote } from "@/types/delivery-note";
import { stockOperationsService } from "./stockOperationsService";
import { purchaseInvoiceService } from "./purchaseInvoiceService";

interface ReceivedQuantity {
  id: string;
  quantity_received: number;
}

export const deliveryNoteApprovalService = {
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
        await stockOperationsService.updateStockForLocation(
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
    await purchaseInvoiceService.createPurchaseInvoice(note, updates);
  }
};
