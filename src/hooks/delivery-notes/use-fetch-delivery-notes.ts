
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DeliveryNote } from "@/types/delivery-note";
import { isSelectQueryError, safeArray, safeGetObject } from "@/utils/supabase-helpers";

export function useFetchDeliveryNotes() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: deliveryNotes = [], isLoading, refetch } = useQuery({
    queryKey: ["delivery-notes", filter],
    queryFn: async () => {
      try {
        let query = supabase
          .from("delivery_notes")
          .select(`
            *,
            supplier:suppliers(*),
            purchase_order:purchase_orders(*),
            items:delivery_note_items(*)
          `)
          .order("created_at", { ascending: false });

        if (filter !== "all") {
          query = query.eq("status", filter);
        }

        if (searchTerm) {
          query = query.or(
            `delivery_number.ilike.%${searchTerm}%,purchase_order.order_number.ilike.%${searchTerm}%`
          );
        }

        const { data, error } = await query;

        if (error) throw error;

        // Process delivery notes to handle potential join errors
        const processedNotes = (data || []).map((note) => {
          // Create default objects for potentially errored joins
          const defaultSupplier = {
            id: note.supplier_id || "",
            name: "Unknown Supplier",
            phone: "",
            email: "",
          };

          const defaultPurchaseOrder = {
            id: note.purchase_order_id || "",
            order_number: "Unknown Order",
            total_amount: 0,
          };

          // Use safe getters to handle SelectQueryErrors
          const supplier = isSelectQueryError(note.supplier)
            ? defaultSupplier
            : note.supplier || defaultSupplier;

          const purchaseOrder = isSelectQueryError(note.purchase_order)
            ? defaultPurchaseOrder
            : note.purchase_order || defaultPurchaseOrder;

          // Handle items which might be a SelectQueryError
          const items = safeArray(note.items, []);

          // Return the processed delivery note
          return {
            id: note.id,
            delivery_number: note.delivery_number,
            created_at: note.created_at,
            status: note.status,
            supplier: supplier,
            purchase_order: purchaseOrder,
            items: items,
          } as DeliveryNote;
        });

        return processedNotes;
      } catch (error) {
        console.error("Error fetching delivery notes:", error);
        toast.error("Erreur lors du chargement des bons de livraison");
        return [];
      }
    },
  });

  return {
    deliveryNotes,
    isLoading,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    refetch,
  };
}
