
import { useQuery } from "@tanstack/react-query";
import { DeliveryNote } from "@/types/delivery-note";
import { db } from "@/utils/db-adapter";
import { supabase } from "@/integrations/supabase/client";

export function useFetchDeliveryNotes() {
  return useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      console.log("Fetching delivery notes...");
      try {
        // Fetch delivery notes directly from Supabase for more reliable results
        const { data: deliveryNotesData, error } = await supabase
          .from('delivery_notes')
          .select(`
            id,
            delivery_number,
            created_at,
            updated_at,
            notes,
            status,
            purchase_order_id,
            supplier_id,
            supplier:suppliers (
              id,
              name,
              phone,
              email
            ),
            purchase_order:purchase_orders (
              id,
              order_number,
              total_amount
            ),
            items:delivery_note_items (
              id,
              product_id,
              quantity_ordered,
              quantity_received,
              unit_price,
              product:catalog (
                id,
                name,
                reference
              )
            )
          `)
          .eq('deleted', false)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching delivery notes:", error);
          return [];
        }

        console.log("Fetched delivery notes:", deliveryNotesData);
        
        // Transform and clean up the data
        const deliveryNotes = Array.isArray(deliveryNotesData) ? deliveryNotesData.map(note => {
          if (!note) return null;
          
          // Handle supplier safely
          const supplier = note.supplier 
            ? {
                id: note.supplier.id || '',
                name: note.supplier.name || 'Fournisseur inconnu',
                phone: note.supplier.phone || '',
                email: note.supplier.email || ''
              } 
            : { 
                id: '',
                name: 'Fournisseur inconnu', 
                phone: '', 
                email: '' 
              };
          
          // Handle purchase order safely
          const purchaseOrder = note.purchase_order 
            ? {
                id: note.purchase_order.id || '',
                order_number: note.purchase_order.order_number || '',
                total_amount: note.purchase_order.total_amount || 0
              } 
            : { 
                id: '',
                order_number: 'N/A', 
                total_amount: 0 
              };

          // Process items with proper typing
          const items = note.items && Array.isArray(note.items) 
            ? note.items.map(item => {
                if (!item) return null;
                
                return {
                  id: item.id || '',
                  product_id: item.product_id || '',
                  quantity_ordered: item.quantity_ordered || 0,
                  quantity_received: item.quantity_received || 0,
                  unit_price: item.unit_price || 0,
                  product: item.product ? {
                    id: item.product.id || '',
                    name: item.product.name || 'Produit non disponible',
                    reference: item.product.reference || ''
                  } : {
                    id: '',
                    name: 'Produit non disponible',
                    reference: ''
                  }
                };
              }).filter(Boolean) 
            : [];
          
          return {
            id: note.id || '',
            delivery_number: note.delivery_number || `BL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            created_at: note.created_at || '',
            updated_at: note.updated_at || '',
            notes: note.notes || '',
            status: note.status || 'pending',
            supplier_id: note.supplier_id,
            purchase_order_id: note.purchase_order_id,
            supplier,
            purchase_order: purchaseOrder,
            items
          } as DeliveryNote;
        }).filter(Boolean) as DeliveryNote[] : [];
        
        console.log("Transformed delivery notes:", deliveryNotes);
        
        // Après avoir récupéré les bons de livraison existants, vérifions s'il existe des commandes approuvées
        // qui n'ont pas encore de bons de livraison, et créons-les si nécessaire
        await syncApprovedPurchaseOrders();
        
        // Une fois la synchronisation terminée, récupérons à nouveau les bons de livraison
        // pour inclure ceux nouvellement créés
        if (deliveryNotes.length === 0) {
          const { data: refreshedData, error: refreshError } = await supabase
            .from('delivery_notes')
            .select(`
              id,
              delivery_number,
              created_at,
              updated_at,
              notes,
              status,
              purchase_order_id,
              supplier_id,
              supplier:suppliers (
                id,
                name,
                phone,
                email
              ),
              purchase_order:purchase_orders (
                id,
                order_number,
                total_amount
              ),
              items:delivery_note_items (
                id,
                product_id,
                quantity_ordered,
                quantity_received,
                unit_price,
                product:catalog (
                  id,
                  name,
                  reference
                )
              )
            `)
            .eq('deleted', false)
            .order('created_at', { ascending: false });
          
          if (!refreshError && refreshedData && refreshedData.length > 0) {
            console.log("Fetched refreshed delivery notes after sync:", refreshedData);
            return transformDeliveryNotes(refreshedData);
          }
        }
        
        return deliveryNotes;
      } catch (error) {
        console.error("Error fetching delivery notes:", error);
        return [];
      }
    }
  });
}

// Helper function to transform delivery notes data
function transformDeliveryNotes(data: any[]): DeliveryNote[] {
  return Array.isArray(data) ? data.map(note => {
    if (!note) return null;
    
    const supplier = note.supplier 
      ? {
          id: note.supplier.id || '',
          name: note.supplier.name || 'Fournisseur inconnu',
          phone: note.supplier.phone || '',
          email: note.supplier.email || ''
        } 
      : { 
          id: '',
          name: 'Fournisseur inconnu', 
          phone: '', 
          email: '' 
        };
    
    const purchaseOrder = note.purchase_order 
      ? {
          id: note.purchase_order.id || '',
          order_number: note.purchase_order.order_number || '',
          total_amount: note.purchase_order.total_amount || 0
        } 
      : { 
          id: '',
          order_number: 'N/A', 
          total_amount: 0 
        };

    const items = note.items && Array.isArray(note.items) 
      ? note.items.map(item => {
          if (!item) return null;
          
          return {
            id: item.id || '',
            product_id: item.product_id || '',
            quantity_ordered: item.quantity_ordered || 0,
            quantity_received: item.quantity_received || 0,
            unit_price: item.unit_price || 0,
            product: item.product ? {
              id: item.product.id || '',
              name: item.product.name || 'Produit non disponible',
              reference: item.product.reference || ''
            } : {
              id: '',
              name: 'Produit non disponible',
              reference: ''
            }
          };
        }).filter(Boolean) 
      : [];
    
    return {
      id: note.id || '',
      delivery_number: note.delivery_number || `BL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      created_at: note.created_at || '',
      updated_at: note.updated_at || '',
      notes: note.notes || '',
      status: note.status || 'pending',
      supplier_id: note.supplier_id,
      purchase_order_id: note.purchase_order_id,
      supplier,
      purchase_order: purchaseOrder,
      items
    } as DeliveryNote;
  }).filter(Boolean) as DeliveryNote[] : [];
}

// Synchronize approved purchase orders with delivery notes
async function syncApprovedPurchaseOrders() {
  try {
    console.log("Syncing approved purchase orders to create delivery notes...");
    
    // Fetch approved purchase orders
    const { data: approvedOrders, error: fetchError } = await supabase
      .from('purchase_orders')
      .select(`
        id,
        supplier_id,
        order_number,
        status,
        items:purchase_order_items(*)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error("Error fetching approved purchase orders:", fetchError);
      return;
    }

    console.log("Found approved purchase orders:", approvedOrders);

    if (!approvedOrders || approvedOrders.length === 0) {
      console.log("No approved purchase orders found");
      return;
    }

    // Pour chaque commande approuvée, vérifier si un bon de livraison existe déjà
    for (const order of approvedOrders) {
      const { data: existingDeliveryNote, error: checkError } = await supabase
        .from('delivery_notes')
        .select('id')
        .eq('purchase_order_id', order.id)
        .maybeSingle();

      if (checkError) {
        console.error(`Error checking for delivery note for order ${order.id}:`, checkError);
        continue;
      }

      // Si aucun bon de livraison n'existe pour cette commande, en créer un
      if (!existingDeliveryNote) {
        console.log(`Creating delivery note for purchase order ${order.id}`);
        
        // Générer un numéro de bon de livraison unique
        const deliveryNumber = `BL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        
        // Créer le bon de livraison
        const { data: newDeliveryNote, error: createError } = await supabase
          .from('delivery_notes')
          .insert({
            purchase_order_id: order.id,
            supplier_id: order.supplier_id,
            delivery_number: deliveryNumber,
            status: 'pending',
            deleted: false,
            notes: `Bon de livraison créé automatiquement depuis la commande ${order.order_number || ''}`
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating delivery note:", createError);
          // Si l'erreur est liée à RLS, ajoutez plus de logs pour debug
          if (createError.code === '42501') {
            console.error("RLS policy violation. This is likely a permission issue.");
            // Continuer avec les autres commandes
          }
          continue;
        }

        if (newDeliveryNote) {
          console.log("Successfully created delivery note:", newDeliveryNote);
          
          // Puis créer les éléments du bon de livraison basés sur les articles du bon de commande
          if (order.items && order.items.length > 0) {
            const deliveryItemsData = order.items.map((item: any) => ({
              delivery_note_id: newDeliveryNote.id,
              product_id: item.product_id,
              quantity_ordered: item.quantity,
              quantity_received: 0, // Valeur initiale, à mettre à jour lors de la réception
              unit_price: item.unit_price
            }));

            const { error: itemsError } = await supabase
              .from('delivery_note_items')
              .insert(deliveryItemsData);

            if (itemsError) {
              console.error("Error creating delivery note items:", itemsError);
            } else {
              console.log("Successfully created delivery note items");
            }
          }
        }
      } else {
        console.log(`Delivery note already exists for order ${order.id}:`, existingDeliveryNote);
      }
    }
  } catch (error) {
    console.error("Error in syncApprovedPurchaseOrders:", error);
  }
}
