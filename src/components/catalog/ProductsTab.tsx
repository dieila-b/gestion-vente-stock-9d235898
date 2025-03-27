
import { useState } from "react";
import { CatalogProduct } from "@/types/catalog";
import { AddProductForm } from "@/components/catalog/AddProductForm";
import { EditProductForm } from "@/components/catalog/EditProductForm";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { ProductSection } from "@/components/catalog/ProductSection";
import { useCatalogMutations } from "@/hooks/use-catalog-mutations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ProductsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<CatalogProduct | null>(null);
  
  const { addProductMutation, updateProductMutation, deleteProductMutation } = useCatalogMutations();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        toast.error("Erreur lors du chargement des produits");
        throw error;
      }

      return data as CatalogProduct[];
    }
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="px-4">
        <CatalogHeader
          onAddProduct={() => setIsAddingProduct(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      <ProductSection
        products={products}
        searchQuery={searchQuery}
        onEdit={setEditingProduct}
        onDelete={setProductToDelete}
      />

      <AddProductForm 
        isOpen={isAddingProduct}
        onClose={() => setIsAddingProduct(false)}
        addProductMutation={addProductMutation}
      />

      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          updateProductMutation={updateProductMutation}
        />
      )}

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={() => setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le produit sera définitivement supprimé du catalogue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => productToDelete && deleteProductMutation.mutate(productToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
