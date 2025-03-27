
import { supabase } from "@/integrations/supabase/client";

interface PreorderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  discount: number;
}

export function preparePreorderItems(cart: any[]): PreorderItem[] {
  return cart.map(item => {
    let itemStatus = 'available';
    if (!item.stock || item.stock === 0) {
      itemStatus = 'pending';
    } else if (item.stock < item.quantity) {
      itemStatus = 'pending';
    }
    
    const unitPriceAfterDiscount = item.price - (item.discount || 0);
    
    return {
      product_id: item.id,
      quantity: item.quantity,
      unit_price: unitPriceAfterDiscount,
      total_price: unitPriceAfterDiscount * item.quantity,
      status: itemStatus,
      discount: item.discount || 0
    };
  });
}

export async function savePreorderItems(items: PreorderItem[], preorderId: string): Promise<void> {
  try {
    const preorderItemsWithId = items.map(item => ({
      ...item,
      preorder_id: preorderId
    }));

    const { error: itemsError } = await supabase
      .from('preorder_items')
      .insert(preorderItemsWithId);

    if (itemsError) throw itemsError;
  } catch (error) {
    console.error('Error saving preorder items:', error);
    throw error;
  }
}

export function determinePreorderStatus(items: PreorderItem[]): string {
  const allItemsAvailable = items.every(item => item.status === 'available');
  return allItemsAvailable ? 'available' : 'pending';
}
