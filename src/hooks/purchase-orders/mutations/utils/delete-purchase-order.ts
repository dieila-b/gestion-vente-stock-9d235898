
import { db } from "@/utils/db-adapter";
import { toast } from "sonner";

export async function deletePurchaseOrder(id: string): Promise<boolean> {
  console.log("Attempting to delete purchase order:", id);

  try {
    // Check if the purchase order exists and is not approved
    const { data: order } = await db.table('purchase_orders')
      .select('status')
      .eq('id', id)
      .single();

    if (!order) {
      throw new Error("Bon de commande introuvable");
    }

    if (order.status === 'approved') {
      throw new Error("Impossible de supprimer un bon de commande approuvé");
    }

    // Delete associated items first
    await db.table('purchase_order_items')
      .delete()
      .eq('purchase_order_id', id);

    // Then delete the purchase order
    const result = await db.delete('purchase_orders', 'id', id);
    
    if (!result) {
      throw new Error("Échec de la suppression");
    }

    console.log("Successfully deleted purchase order:", id);
    return true;
  } catch (error: any) {
    console.error("Error deleting purchase order:", error);
    throw new Error(`Erreur lors de la suppression: ${error.message}`);
  }
}
