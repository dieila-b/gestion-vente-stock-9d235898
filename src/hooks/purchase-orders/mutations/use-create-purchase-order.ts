
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { safeSupplier } from "@/utils/data-safe"; 
import { db } from "@/utils/db-core";
import { PurchaseOrder, Supplier } from "@/types/purchase-order";

export function useCreatePurchaseOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const createPurchaseOrder = async (data: Partial<Omit<PurchaseOrder, 'supplier' | 'warehouse' | 'items'>>) => {
    try {
      console.log("Creating purchase order with data:", data);
      
      // Make sure all required fields are present
      const purchaseOrderData = {
        order_number: data.order_number || `PO-${new Date().getTime().toString().slice(-8)}`,
        supplier_id: data.supplier_id,
        status: data.status || 'draft',
        payment_status: data.payment_status || 'pending',
        total_amount: data.total_amount || 0,
        logistics_cost: data.logistics_cost || 0,
        transit_cost: data.transit_cost || 0,
        tax_rate: data.tax_rate || 0,
        subtotal: data.subtotal || 0,
        tax_amount: data.tax_amount || 0,
        total_ttc: data.total_ttc || 0,
        shipping_cost: data.shipping_cost || 0,
        discount: data.discount || 0,
        notes: data.notes || '',
        warehouse_id: data.warehouse_id,
        paid_amount: data.paid_amount || 0,
        expected_delivery_date: data.expected_delivery_date || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Create the purchase order
      const { data: createdOrder, error } = await supabase
        .from('purchase_orders')
        .insert(purchaseOrderData)
        .select()
        .single();

      if (error) {
        console.error("Error creating purchase order:", error);
        throw error;
      }

      if (!createdOrder) {
        throw new Error("Failed to create purchase order");
      }

      console.log("Successfully created purchase order:", createdOrder);

      // Get supplier info if available
      let supplierInfo: Partial<Supplier> = { 
        id: createdOrder.supplier_id || '', 
        name: "Fournisseur inconnu", 
        phone: "", 
        email: "" 
      };
      
      if (createdOrder.supplier_id) {
        try {
          const { data: supplierData } = await supabase
            .from('suppliers')
            .select('*')
            .eq('id', createdOrder.supplier_id)
            .single();
            
          if (supplierData) {
            supplierInfo = safeSupplier(supplierData);
          }
        } catch (supplierError) {
          console.error("Error fetching supplier:", supplierError);
        }
      }

      // Add supplementary data for the UI
      const enhancedOrder = {
        ...createdOrder,
        supplier: {
          id: createdOrder.supplier_id || '',
          name: supplierInfo.name || "Fournisseur inconnu",
          phone: supplierInfo.phone || "",
          email: supplierInfo.email || ""
        },
        items: [],
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
