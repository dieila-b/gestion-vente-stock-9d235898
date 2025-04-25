
import { db } from "@/utils/db-adapter";

export async function deletePurchaseOrder(id: string): Promise<boolean> {
  console.log("Attempting to delete purchase order:", id);

  try {
    if (!id) {
      console.error("Invalid purchase order ID:", id);
      throw new Error("ID du bon de commande invalide");
    }

    // Check if the purchase order exists and is not approved
    const { data: order, error: orderError } = await db.table('purchase_orders')
      .select('status')
      .eq('id', id)
      .single();
    
    if (orderError) {
      console.error("Error fetching purchase order:", orderError);
      throw new Error("Impossible de trouver le bon de commande");
    }

    if (!order) {
      console.error("Purchase order not found:", id);
      throw new Error("Bon de commande introuvable");
    }

    if (order.status === 'approved') {
      console.error("Cannot delete approved purchase order:", id);
      throw new Error("Impossible de supprimer un bon de commande approuvé");
    }

    // Delete associated items first
    console.log("Deleting purchase order items for order:", id);
    const { error: itemsError } = await db.table('purchase_order_items')
      .delete()
      .eq('purchase_order_id', id);
    
    if (itemsError) {
      console.error("Error deleting purchase order items:", itemsError);
      throw new Error("Échec de la suppression des articles de commande");
    }

    // Then delete the purchase order
    console.log("Deleting purchase order:", id);
    const { error: orderDeleteError } = await db.table('purchase_orders')
      .delete()
      .eq('id', id);
    
    if (orderDeleteError) {
      console.error("Error deleting purchase order:", orderDeleteError);
      throw new Error("Échec de la suppression du bon de commande");
    }
    
    console.log("Successfully deleted purchase order:", id);
    return true;
  } catch (error: any) {
    console.error("Error deleting purchase order:", error);
    throw error; // Propager l'erreur pour qu'elle soit gérée par le gestionnaire d'erreur de la mutation
  }
}
