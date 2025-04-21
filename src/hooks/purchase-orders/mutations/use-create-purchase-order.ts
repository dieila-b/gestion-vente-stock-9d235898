
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";
import { db } from "@/utils/db-core";

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (orderData: Partial<PurchaseOrder>) => {
      console.log("Creating purchase order with data:", orderData);

      // Générer le numéro de commande si non fourni
      const finalOrderData = {
        ...orderData,
        order_number: orderData.order_number || `BC-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        status: orderData.status || 'pending',
        payment_status: orderData.payment_status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Supprimer les propriétés complexes ou non liées à la table DB
      const cleanOrderData = { ...finalOrderData };
      if ("supplier" in cleanOrderData) {
        delete cleanOrderData.supplier;
      }
      if ("warehouse" in cleanOrderData) {
        delete cleanOrderData.warehouse;
      }
      if ("items" in cleanOrderData) {
        delete cleanOrderData.items;
      }
      if ("deleted" in cleanOrderData) {
        delete cleanOrderData.deleted;
      }

      // Nettoyer les undefined (sinon JSON.stringify met "undefined" à null)
      Object.keys(cleanOrderData).forEach((key) => {
        if (cleanOrderData[key] === undefined) {
          delete cleanOrderData[key];
        }
      });

      try {
        console.log("Tentative d'insertion directe via Supabase...");
        // Tentative normale
        const { data: insertResult, error } = await supabase
          .from("purchase_orders")
          .insert(cleanOrderData)
          .select()
          .single();

        if (!error && insertResult) {
          console.log("Commande fournisseur créée via insertion directe :", insertResult);
          return insertResult;
        }

        // Si échec, fallback RPC
        if (error) {
          console.error("Échec insertion Supabase :", error);
          console.log("Tentative via fonction RPC bypass_insert_purchase_order...");

          // On passe un objet JSON-sérialisable à la fonction RPC
          const jsonSafeData = JSON.parse(JSON.stringify(cleanOrderData));
          const { data: rpcResult, error: rpcError } = await supabase.rpc(
            "bypass_insert_purchase_order",
            { order_data: jsonSafeData }
          );

          if (rpcError) {
            console.error("Échec fallback RPC :", rpcError);
            throw rpcError;
          }

          if (rpcResult) {
            // Certains retours RPC renvoient l'objet direct, parfois dans un tableau
            const order = Array.isArray(rpcResult) && rpcResult.length > 0 ? rpcResult[0] : rpcResult;
            console.log("RPC fallback OK :", order);
            return order;
          }
        }

        throw new Error("Impossible de créer le bon de commande");
      } catch (error) {
        console.error("Erreur lors de la création du bon de commande :", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success("Bon de commande créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      return data;
    },
    onError: (error: any) => {
      console.error("Erreur création bon de commande :", error);
      toast.error(
        `Erreur lors de la création: ${error.message || "Erreur inconnue"}`
      );
    },
  });

  return mutation;
}
