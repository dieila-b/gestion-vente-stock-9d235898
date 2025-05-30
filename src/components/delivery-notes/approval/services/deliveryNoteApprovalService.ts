
import { supabase } from "@/integrations/supabase/client";
import { DeliveryNote } from "@/types/delivery-note";
import { stockOperationsService } from "./stockOperationsService";
import { toast } from "sonner";

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
    console.log('=== DELIVERY NOTE APPROVAL SERVICE START ===');
    console.log('Starting delivery note approval process for:', note.delivery_number);
    console.log('Note ID:', note.id);
    console.log('Received quantities:', receivedQuantities);
    console.log('Selected location ID:', selectedLocationId);
    
    if (!note.items || note.items.length === 0) {
      throw new Error('Aucun article trouvé dans le bon de livraison');
    }

    // Vérifier que nous avons au moins une quantité reçue
    const hasReceivedItems = Object.values(receivedQuantities).some(qty => qty > 0);
    if (!hasReceivedItems) {
      throw new Error('Aucune quantité reçue spécifiée');
    }

    try {
      // 1. Update delivery note items with received quantities
      console.log('=== STEP 1: Updating delivery note items ===');
      const updates = note.items.map(item => ({
        id: item.id,
        quantity_received: receivedQuantities[item.id] || 0
      }));

      console.log('Items to update:', updates);

      // Update each delivery note item
      for (const update of updates) {
        console.log(`Updating item ${update.id} with quantity ${update.quantity_received}`);
        
        const { error } = await supabase
          .from('delivery_note_items')
          .update({ quantity_received: update.quantity_received })
          .eq('id', update.id);
        
        if (error) {
          console.error('Error updating delivery note item:', error);
          throw new Error(`Erreur lors de la mise à jour de l'article ${update.id}: ${error.message}`);
        }
        
        console.log(`Successfully updated item ${update.id}`);
      }

      // 2. Update stocks for each received item
      console.log('=== STEP 2: Updating stocks ===');
      for (const item of note.items) {
        const receivedQty = receivedQuantities[item.id] || 0;
        console.log(`Processing item ${item.id}: received quantity = ${receivedQty}`);
        
        if (receivedQty > 0) {
          console.log(`Updating stock for product ${item.product_id} with quantity ${receivedQty}`);
          try {
            await stockOperationsService.updateStockForLocation(
              item.product_id,
              receivedQty,
              item.unit_price,
              selectedLocationId,
              warehouses,
              posLocations,
              note.delivery_number
            );
            console.log(`Stock updated successfully for product ${item.product_id}`);
          } catch (stockError: any) {
            console.error(`Error updating stock for product ${item.product_id}:`, stockError);
            // Continue with other items even if one fails
            console.warn(`Continuing despite stock update error for product ${item.product_id}`);
          }
        } else {
          console.log(`Skipping stock update for item ${item.id} (quantity = 0)`);
        }
      }

      // 3. Update delivery note status to 'received'
      console.log('=== STEP 3: Updating delivery note status ===');
      console.log('Updating delivery note status to received...');
      console.log('This should trigger the database trigger to create purchase invoice...');
      
      const { error: noteError, data: updatedNote } = await supabase
        .from('delivery_notes')
        .update({ 
          status: 'received',
          warehouse_id: selectedLocationId,
          updated_at: new Date().toISOString()
        })
        .eq('id', note.id)
        .select();
      
      if (noteError) {
        console.error('Error updating delivery note status:', noteError);
        throw new Error(`Erreur lors de la mise à jour du statut: ${noteError.message}`);
      }

      console.log('Delivery note updated successfully:', updatedNote);

      // 4. Vérifier si la facture d'achat a été créée par le déclencheur
      console.log('=== STEP 4: Checking if purchase invoice was created ===');
      
      // Attendre un peu pour laisser le temps au déclencheur de s'exécuter
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: purchaseInvoices, error: invoiceError } = await supabase
        .from('purchase_invoices')
        .select('*')
        .eq('supplier_id', note.supplier_id)
        .ilike('invoice_number', `FA-${note.delivery_number.replace('BL-', '')}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (invoiceError) {
        console.error('Error checking for purchase invoice:', invoiceError);
      } else {
        console.log('Purchase invoices found:', purchaseInvoices);
        if (purchaseInvoices && purchaseInvoices.length > 0) {
          console.log('✅ Purchase invoice created successfully:', purchaseInvoices[0]);
          toast.success(`Facture d'achat ${purchaseInvoices[0].invoice_number} créée automatiquement`);
        } else {
          console.warn('⚠️ No purchase invoice found - trigger may not have executed');
          
          // Essayer de créer manuellement la facture si le déclencheur a échoué
          console.log('=== FALLBACK: Creating purchase invoice manually ===');
          const totalAmount = note.items.reduce((sum, item) => {
            const receivedQty = receivedQuantities[item.id] || 0;
            return sum + (receivedQty * item.unit_price);
          }, 0);

          if (totalAmount > 0) {
            const invoiceNumber = `FA-${note.delivery_number.replace('BL-', '')}-${Date.now()}`;
            
            const { data: manualInvoice, error: manualError } = await supabase
              .from('purchase_invoices')
              .insert({
                invoice_number: invoiceNumber,
                supplier_id: note.supplier_id,
                total_amount: totalAmount,
                status: 'pending'
              })
              .select();

            if (manualError) {
              console.error('Error creating manual purchase invoice:', manualError);
              toast.error('Erreur lors de la création manuelle de la facture d\'achat');
            } else {
              console.log('✅ Manual purchase invoice created:', manualInvoice);
              toast.success(`Facture d'achat ${invoiceNumber} créée manuellement`);
            }
          }
        }
      }

      console.log('=== APPROVAL PROCESS COMPLETED SUCCESSFULLY ===');
      console.log('Delivery note approval process completed successfully');
      
    } catch (error: any) {
      console.error('=== APPROVAL PROCESS FAILED ===');
      console.error('Error in delivery note approval process:', error);
      throw error;
    }
  }
};
