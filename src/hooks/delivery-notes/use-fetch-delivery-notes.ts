
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DeliveryNote } from "@/types/delivery-note";

/**
 * Hook to fetch delivery notes from the database with their items
 */
export function useFetchDeliveryNotes() {
  return useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      console.log("Fetching delivery notes with items...");
      try {
        // First, fetch delivery notes with basic relations
        const { data: deliveryNotesData, error } = await supabase
          .from('bons de livraison')
          .select(`
            id,
            numero_bon_livraison,
            created_at,
            updated_at,
            statut,
            notes,
            bon_commande_id,
            fournisseur_id,
            entrepot_id,
            supprime,
            fournisseurs (
              id,
              nom,
              email,
              telephone
            ),
            bons_de_commande (
              id,
              numero_commande,
              montant_total
            )
          `)
          .eq('supprime', false)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching delivery notes:", error);
          // Fallback to English table names if French names don't work
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('delivery_notes')
            .select(`
              id,
              delivery_number,
              created_at,
              updated_at,
              status,
              notes,
              purchase_order_id,
              supplier_id,
              warehouse_id,
              deleted,
              supplier:suppliers (
                id,
                name,
                email,
                phone
              ),
              purchase_order:purchase_orders (
                id,
                order_number,
                total_amount
              )
            `)
            .eq('deleted', false)
            .order('created_at', { ascending: false });
          
          if (fallbackError) {
            console.error("Error with fallback delivery notes:", fallbackError);
            throw fallbackError;
          }
          
          deliveryNotesData = fallbackData;
        }

        console.log("Raw delivery notes data:", deliveryNotesData);
        
        if (!deliveryNotesData || deliveryNotesData.length === 0) {
          console.log("No delivery notes found");
          return [];
        }

        // Fetch items for all delivery notes in one query using French table name first
        const deliveryNoteIds = deliveryNotesData.map(note => note.id);
        console.log("Fetching items for delivery note IDs:", deliveryNoteIds);
        
        let itemsData = null;
        let itemsError = null;
        
        // Try French table name first
        const { data: frenchItemsData, error: frenchItemsError } = await supabase
          .from('articles_de_bon_de_livraison')
          .select(`
            id,
            bon_de_livraison_id,
            produit_id,
            quantite_commandee,
            quantite_recue,
            prix_unitaire,
            catalog(
              id,
              name,
              reference
            )
          `)
          .in('bon_de_livraison_id', deliveryNoteIds);
          
        if (frenchItemsError) {
          console.warn("French table name failed, trying English:", frenchItemsError);
          // Fallback to English table name
          const { data: englishItemsData, error: englishItemsError } = await supabase
            .from('delivery_note_items')
            .select(`
              id,
              delivery_note_id,
              product_id,
              quantity_ordered,
              quantity_received,
              unit_price,
              product:catalog(
                id,
                name,
                reference
              )
            `)
            .in('delivery_note_id', deliveryNoteIds);
            
          itemsData = englishItemsData;
          itemsError = englishItemsError;
        } else {
          itemsData = frenchItemsData;
          itemsError = frenchItemsError;
        }
          
        if (itemsError) {
          console.error("Error fetching delivery note items:", itemsError);
          console.warn("Will proceed without items data");
        }

        console.log("Fetched items data:", itemsData);
        console.log("Number of items found:", itemsData?.length || 0);
        
        // Group items by delivery note ID (handle both French and English field names)
        const itemsByDeliveryNote = (itemsData || []).reduce((acc, item) => {
          // Handle both French and English field names
          const deliveryNoteId = item.bon_de_livraison_id || item.delivery_note_id;
          const productId = item.produit_id || item.product_id;
          const quantityOrdered = item.quantite_commandee || item.quantity_ordered;
          const quantityReceived = item.quantite_recue || item.quantity_received;
          const unitPrice = item.prix_unitaire || item.unit_price;
          
          if (!acc[deliveryNoteId]) {
            acc[deliveryNoteId] = [];
          }
          acc[deliveryNoteId].push({
            id: item.id,
            delivery_note_id: deliveryNoteId,
            product_id: productId,
            quantity_ordered: quantityOrdered,
            quantity_received: quantityReceived,
            unit_price: unitPrice,
            product: item.catalog || item.product ? {
              id: (item.catalog || item.product).id,
              name: (item.catalog || item.product).name,
              reference: (item.catalog || item.product).reference
            } : {
              id: productId,
              name: 'Produit non disponible',
              reference: ''
            }
          });
          return acc;
        }, {} as Record<string, any[]>);
        
        console.log("Items grouped by delivery note:", itemsByDeliveryNote);
        
        // Transform the data to match our TypeScript interfaces (handle both French and English field names)
        const transformedNotes: DeliveryNote[] = deliveryNotesData.map(note => {
          const noteItems = itemsByDeliveryNote[note.id] || [];
          console.log(`Note ${note.id} (${note.numero_bon_livraison || note.delivery_number}) has ${noteItems.length} items`);
          
          // Handle both French and English field names
          const deliveryNumber = note.numero_bon_livraison || note.delivery_number || `BL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
          const status = note.statut || note.status || 'pending';
          const supplierId = note.fournisseur_id || note.supplier_id;
          const purchaseOrderId = note.bon_commande_id || note.purchase_order_id;
          const warehouseId = note.entrepot_id || note.warehouse_id;
          const deleted = note.supprime || note.deleted || false;
          
          return {
            id: note.id,
            delivery_number: deliveryNumber,
            created_at: note.created_at || '',
            updated_at: note.updated_at || '',
            notes: note.notes || '',
            status: status,
            supplier_id: supplierId,
            purchase_order_id: purchaseOrderId,
            warehouse_id: warehouseId,
            deleted: deleted,
            supplier: (note.fournisseurs || note.supplier) ? {
              id: (note.fournisseurs || note.supplier).id,
              name: (note.fournisseurs || note.supplier).nom || (note.fournisseurs || note.supplier).name,
              phone: (note.fournisseurs || note.supplier).telephone || (note.fournisseurs || note.supplier).phone || '',
              email: (note.fournisseurs || note.supplier).email || ''
            } : {
              id: '',
              name: 'Fournisseur inconnu',
              phone: '',
              email: ''
            },
            purchase_order: (note.bons_de_commande || note.purchase_order) ? {
              id: (note.bons_de_commande || note.purchase_order).id,
              order_number: (note.bons_de_commande || note.purchase_order).numero_commande || (note.bons_de_commande || note.purchase_order).order_number || '',
              total_amount: (note.bons_de_commande || note.purchase_order).montant_total || (note.bons_de_commande || note.purchase_order).total_amount || 0
            } : {
              id: '',
              order_number: 'N/A',
              total_amount: 0
            },
            items: noteItems
          } as DeliveryNote;
        });
        
        console.log("Final transformed delivery notes:", transformedNotes);
        console.log("Total delivery notes returned:", transformedNotes.length);
        
        // Log items count for each note
        transformedNotes.forEach(note => {
          console.log(`Note ${note.delivery_number}: ${note.items.length} items`);
        });
        
        return transformedNotes;
      } catch (error) {
        console.error("Error in delivery notes fetch:", error);
        throw error;
      }
    },
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
