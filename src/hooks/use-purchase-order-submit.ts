
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PurchaseOrderItem } from "@/types/purchase-order";
import { toast } from "sonner";
import { useCreatePurchaseOrder } from "@/hooks/purchase-orders/mutations/use-create-purchase-order";
import { supabase } from "@/integrations/supabase/client";

interface OrderData {
  supplier_id: string;
  expected_delivery_date: string | null;
  notes: string;
  items: PurchaseOrderItem[];
  total_amount: number;
}

export const usePurchaseOrderSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createPurchaseOrderMutation = useCreatePurchaseOrder();
  const navigate = useNavigate();

  const submitPurchaseOrder = async (orderData: OrderData) => {
    setIsSubmitting(true);
    
    try {
      console.log("Création du bon de commande avec les données:", orderData);

      // Calculer les montants
      const subtotal = orderData.total_amount;
      const taxAmount = 0; // Pas de taxe par défaut
      const totalTTC = subtotal;

      // Préparer les données de commande
      const purchaseOrderData = {
        supplier_id: orderData.supplier_id,
        order_number: `BC-${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000)}`,
        expected_delivery_date: orderData.expected_delivery_date || new Date().toISOString(),
        notes: orderData.notes,
        status: 'pending' as const,
        payment_status: 'pending' as const,
        paid_amount: 0,
        logistics_cost: 0,
        transit_cost: 0,
        tax_rate: 0,
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_ttc: totalTTC,
        shipping_cost: 0,
        discount: 0,
        total_amount: totalTTC,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Utiliser la mutation pour créer la commande
      const result = await createPurchaseOrderMutation.mutateAsync(purchaseOrderData);
      
      // Extraire l'ID du bon de commande
      let purchaseOrderId: string | null = null;
      
      if (result && typeof result === 'object') {
        if ('id' in result && result.id) {
          purchaseOrderId = String(result.id);
        }
      }
      
      console.log("Bon de commande créé avec l'ID:", purchaseOrderId);

      if (purchaseOrderId && orderData.items.length > 0) {
        // Préparer les éléments pour insertion
        const validOrderItems = orderData.items
          .filter(item => item.quantity > 0)
          .map(item => ({
            purchase_order_id: purchaseOrderId,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            selling_price: item.selling_price || 0,
            total_price: item.unit_price * item.quantity,
            created_at: new Date().toISOString()
          }));

        if (validOrderItems.length > 0) {
          console.log("Ajout des articles à la commande:", validOrderItems);

          try {
            // Utiliser la fonction RPC pour l'insertion des articles
            const jsonSafeItems = JSON.parse(JSON.stringify(validOrderItems));
            console.log("Données d'articles envoyées à RPC:", jsonSafeItems);
            
            const { data: itemsResult, error: itemsError } = await supabase.rpc(
              'bypass_insert_purchase_order_items',
              { items_data: jsonSafeItems }
            );

            if (itemsError) {
              console.error("Erreur RPC pour les articles:", itemsError);
              
              // Fallback vers insertion directe
              const { error: directItemsError } = await supabase
                .from('purchase_order_items')
                .insert(validOrderItems);
                
              if (directItemsError) {
                console.error("Erreur insertion directe des articles:", directItemsError);
                toast.error(`Erreur lors de l'ajout des produits: ${directItemsError.message}`);
              } else {
                console.log("Articles ajoutés avec succès via insertion directe");
              }
            } else {
              console.log("Articles ajoutés avec succès via RPC:", itemsResult);
            }
          } catch (error) {
            console.error("Erreur lors de l'ajout des articles:", error);
            toast.error(`Erreur lors de l'ajout des produits: ${(error as Error).message}`);
          }
        }

        toast.success("Bon de commande créé avec succès");
        navigate("/purchase-orders");
      } else {
        throw new Error("Échec de la création du bon de commande - aucun ID retourné");
      }
    } catch (error: any) {
      console.error("Erreur création bon de commande:", error);
      toast.error(`Une erreur est survenue: ${error.message || "Erreur inconnue"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitPurchaseOrder,
    isSubmitting
  };
};
