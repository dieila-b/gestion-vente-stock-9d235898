
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as z from "zod";

export const stockEntrySchema = z.object({
  warehouseId: z.string().min(1, "Le dépôt est requis"),
  productId: z.string().min(1, "Le produit est requis"),
  quantity: z.number().min(1, "La quantité doit être supérieure à 0"),
  unitPrice: z.number().min(0, "Le prix unitaire doit être positif"),
  reason: z.string().min(1, "Le motif est requis")
});

export type StockEntryForm = z.infer<typeof stockEntrySchema>;

export interface StockMovement {
  id: string;
  product: {
    id: string;
    name: string;
    reference: string;
  };
  warehouse: {
    id: string;
    name: string;
  };
  pos_location: {
    id: string;
    name: string;
  } | null | undefined;
  quantity: number;
  unit_price: number;
  total_value: number;
  reason: string;
  type: "in" | "out";
  created_at: string;
}

export function useStockMovements(type: 'in' | 'out') {
  const queryClient = useQueryClient();

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['stock-movements', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_stock_movements')
        .select(`
          id,
          quantity,
          unit_price,
          total_value,
          reason,
          type,
          created_at,
          product:product_id (
            id,
            name,
            reference
          ),
          warehouse:warehouse_id (
            id,
            name
          ),
          pos_location:pos_location_id (
            id,
            name
          )
        `)
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Erreur lors du chargement des mouvements de type ${type}:`, error);
        throw error;
      }

      return (data || []) as unknown as StockMovement[];
    }
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('status', 'Actif');

      if (error) throw error;
      return data;
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('id, name, reference')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const createStockEntry = async (data: StockEntryForm) => {
    try {
      console.log("Submitting stock entry:", data);
      
      // Calculate total value
      const totalValue = data.quantity * data.unitPrice;
      
      // Create the stock movement entry
      const { data: movementData, error: movementError } = await supabase
        .from('warehouse_stock_movements')
        .insert({
          warehouse_id: data.warehouseId,
          product_id: data.productId,
          quantity: data.quantity,
          unit_price: data.unitPrice,
          total_value: totalValue,
          reason: data.reason,
          type: 'in'
        })
        .select();

      if (movementError) {
        console.error("Error creating movement:", movementError);
        throw movementError;
      }
      
      console.log("Movement created successfully:", movementData);

      // Update warehouse stock quantities
      const { data: existingStock, error: stockQueryError } = await supabase
        .from('warehouse_stock')
        .select('id, quantity, unit_price')
        .eq('warehouse_id', data.warehouseId)
        .eq('product_id', data.productId)
        .maybeSingle();

      if (stockQueryError) {
        console.error("Error querying existing stock:", stockQueryError);
        throw stockQueryError;
      }

      if (existingStock) {
        // Update existing stock
        const newQuantity = existingStock.quantity + data.quantity;
        const newTotalValue = newQuantity * existingStock.unit_price;
        
        console.log("Updating existing stock:", {
          id: existingStock.id,
          newQuantity,
          newTotalValue
        });
        
        const { error: updateError } = await supabase
          .from('warehouse_stock')
          .update({
            quantity: newQuantity,
            total_value: newTotalValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingStock.id);

        if (updateError) {
          console.error("Error updating stock:", updateError);
          throw updateError;
        }
      } else {
        // Insert new stock record
        console.log("Creating new stock record for product in warehouse");
        
        const { error: insertError } = await supabase
          .from('warehouse_stock')
          .insert({
            warehouse_id: data.warehouseId,
            product_id: data.productId,
            quantity: data.quantity,
            unit_price: data.unitPrice,
            total_value: data.quantity * data.unitPrice
          });

        if (insertError) {
          console.error("Error inserting new stock:", insertError);
          throw insertError;
        }
      }

      toast.success("Entrée de stock enregistrée avec succès");
      queryClient.invalidateQueries({ queryKey: ['stock-movements', type] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast.error("Erreur lors de l'enregistrement de l'entrée");
      return false;
    }
  };

  return {
    movements,
    isLoading,
    warehouses,
    products,
    createStockEntry
  };
}
