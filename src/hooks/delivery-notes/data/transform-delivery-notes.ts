
import { DeliveryNote } from "@/types/delivery-note";

/**
 * Transforms raw delivery notes data from Supabase into properly typed DeliveryNote objects
 */
export function transformDeliveryNotes(data: any[]): DeliveryNote[] {
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
