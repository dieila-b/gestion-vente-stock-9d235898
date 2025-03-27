
import { supabase } from "@/integrations/supabase/client";

export async function updateDeliveryStatus(
  invoice: any, 
  deliveryStatus: string,
  deliveredItems?: Record<string, { delivered: boolean, quantity: number }>
) {
  try {
    console.log("Beginning delivery status update for items");
    const updatedItems: any[] = [];
    
    // Update delivered quantities for items if provided
    if (deliveredItems && Object.keys(deliveredItems).length > 0) {
      console.log("Processing specific delivery items with data:", deliveredItems);
      
      for (const [itemId, data] of Object.entries(deliveredItems)) {
        // Only process items that are marked as delivered or have a quantity > 0
        if (data.delivered || data.quantity > 0) {
          const itemData = invoice.items.find((i: any) => i.id === itemId);
          
          if (itemData) {
            console.log(`Processing item ${itemId}:`, {
              current: itemData,
              newData: data,
              totalQuantity: itemData.quantity
            });
            
            // Calculate the proper delivery status based on quantity
            const newDeliveryStatus = data.quantity >= itemData.quantity ? 'delivered' : 'partial';
            const quantityToUpdate = Math.min(data.quantity, itemData.quantity); // Ensure we don't exceed total
            
            console.log(`Updating item ${itemId} with:`, {
              delivered_quantity: quantityToUpdate,
              delivery_status: newDeliveryStatus
            });
            
            const { data: updatedItem, error } = await supabase
              .from('order_items')
              .update({
                delivered_quantity: quantityToUpdate,
                delivery_status: newDeliveryStatus
              })
              .eq('id', itemId)
              .select('*')
              .single();
              
            if (error) {
              console.error(`Error updating item ${itemId}:`, error);
              throw error;
            }
            
            // Add updated item to the array
            if (updatedItem) {
              console.log(`Item ${itemId} updated successfully:`, updatedItem);
              updatedItems.push({
                ...itemData,
                delivered_quantity: quantityToUpdate,
                delivery_status: newDeliveryStatus
              });
            }
          } else {
            console.warn(`Item with ID ${itemId} not found in invoice items`);
          }
        } else {
          console.log(`Skipping item ${itemId} - not marked for delivery`);
        }
      }
    } 
    // If the overall status is "delivered" but no specific items were updated,
    // mark all items as delivered
    else if (deliveryStatus === 'delivered') {
      console.log("Updating all items to fully delivered");
      
      for (const item of invoice.items) {
        console.log(`Setting item ${item.id} to fully delivered`);
        
        const { data: updatedItem, error } = await supabase
          .from('order_items')
          .update({
            delivered_quantity: item.quantity,
            delivery_status: 'delivered'
          })
          .eq('id', item.id)
          .select('*')
          .single();
          
        if (error) {
          console.error(`Error updating item ${item.id} to delivered:`, error);
          throw error;
        }
        
        // Add updated item to the array
        if (updatedItem) {
          console.log(`Item ${item.id} marked as delivered:`, updatedItem);
          updatedItems.push({
            ...item,
            delivered_quantity: item.quantity,
            delivery_status: 'delivered'
          });
        }
      }
    }
    
    console.log(`Completed delivery status update. Updated ${updatedItems.length} items.`);
    
    // Return updated items if there are any
    return updatedItems.length > 0 ? updatedItems : null;
  } catch (error) {
    console.error('Error updating delivery status:', error);
    return null;
  }
}
