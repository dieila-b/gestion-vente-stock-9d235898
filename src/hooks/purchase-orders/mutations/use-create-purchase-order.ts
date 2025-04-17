
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { safeSupplier } from "@/utils/data-safe"; 
import { db } from "@/utils/db-core";
import { PurchaseOrder } from "@/types/purchase-order";

export function useCreatePurchaseOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const createPurchaseOrder = async (data: Partial<Omit<PurchaseOrder, 'supplier' | 'warehouse' | 'items'>>) => {
    try {
      console.log("Creating purchase order with data:", data);
      
      // Remove deleted property before sending to database since the column doesn't exist
      const { deleted, ...dataForDb } = data;
      
      // Create the purchase order without the deleted field
      const purchaseOrder = await db.insert(
        'purchase_orders',
        {
          ...dataForDb,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );

      if (!purchaseOrder) {
        throw new Error("Failed to create purchase order");
      }

      console.log("Successfully created purchase order:", purchaseOrder);

      // Add supplementary data for the UI
      const supplier = safeSupplier(purchaseOrder.supplier);
      const enhancedOrder = {
        ...purchaseOrder,
        supplier: {
          name: supplier.name || "Unknown Supplier",
          phone: supplier.phone || "",
          email: supplier.email || ""
        },
        // Explicit cast for properties that might not exist in the database
        // but are expected in the UI
        deleted: false
      };

      toast.success("Bon de commande créé avec succès");
      return enhancedOrder;
    } catch (error) {
      console.error("Error creating purchase order:", error);
      toast.error("Erreur lors de la création du bon de commande");
      throw error;
    }
  };

  const handleCreate = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createPurchaseOrder(data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAndRedirect = async (data: any) => {
    try {
      const result = await handleCreate(data);
      navigate('/purchase-orders');
      return result;
    } catch (error) {
      console.error("Failed to create purchase order:", error);
      // Error is already handled in handleCreate
    }
  };

  return {
    createPurchaseOrder,
    handleCreate,
    handleCreateAndRedirect,
    isLoading,
    error
  };
}
