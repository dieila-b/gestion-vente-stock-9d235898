import { CatalogProduct } from "@/types/catalog";
import { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCatalogMutations = () => {
  const queryClient = useQueryClient();

  const addProductMutation = useMutation({
    mutationFn: async (product: Omit<CatalogProduct, 'id'>) => {
      const { unit_id, ...productWithoutUnitId } = product;
      
      const { data, error } = await supabase
        .from('catalog')
        .insert([productWithoutUnitId])
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      toast.success("Produit ajouté avec succès");
    },
    onError: (error) => {
      console.error('Error details:', error);
      toast.error("Erreur lors de l'ajout du produit. Veuillez réessayer.");
    }
  });

  const updateProductMutation = useMutation<CatalogProduct, PostgrestError, { product: CatalogProduct, onClose: () => void }>({
    mutationFn: async ({ product }) => {
      const { data, error } = await supabase
        .from('catalog')
        .update(product)
        .eq('id', product.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { onClose }) => {
      queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      toast.success("Produit mis à jour avec succès");
      onClose();
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error("Erreur lors de la mise à jour du produit");
    }
  });

  const deleteProductMutation = useMutation<void, PostgrestError, CatalogProduct>({
    mutationFn: async (product) => {
      const { error } = await supabase
        .from('catalog')
        .delete()
        .eq('id', product.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      toast.success("Produit supprimé avec succès");
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast.error("Erreur lors de la suppression du produit");
    }
  });

  return {
    addProductMutation,
    updateProductMutation,
    deleteProductMutation
  };
};
