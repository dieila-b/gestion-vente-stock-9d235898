
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CatalogProduct } from "@/types/catalog";
import { UseMutationResult } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useProductUnits } from "@/hooks/use-product-units";
import { ImageUploadSection } from "./product-form/ImageUploadSection";
import { ProductDetailsSection } from "./product-form/ProductDetailsSection";
import { PricingDetailsSection } from "./product-form/PricingDetailsSection";
import { InventoryDetailsSection } from "./product-form/InventoryDetailsSection";
import { ProductFormActions } from "./product-form/ProductFormActions";

interface EditProductFormProps {
  product: CatalogProduct;
  isOpen: boolean;
  onClose: () => void;
  updateProductMutation: UseMutationResult<any, PostgrestError, { product: CatalogProduct, onClose: () => void }, unknown>;
}

export const EditProductForm = ({ product, isOpen, onClose, updateProductMutation }: EditProductFormProps) => {
  const [editedProduct, setEditedProduct] = useState<CatalogProduct>(product);
  const [uploading, setUploading] = useState(false);
  const { units } = useProductUnits();

  // Fetch categories from existing products
  const handleProductChange = (updatedProduct: Partial<CatalogProduct>) => {
    setEditedProduct((prev) => ({ ...prev, ...updatedProduct }));
  };

  const handleImageChange = (url: string) => {
    handleProductChange({ image_url: url });
  };

  const handleSubmit = () => {
    if (!editedProduct.name || !editedProduct.price) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    updateProductMutation.mutate({ product: editedProduct, onClose });
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed inset-0 m-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 enhanced-glass animate-in fade-in zoom-in">
      <h2 className="text-2xl font-bold mb-6 text-gradient">Modifier le Produit</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageUploadSection 
          value={editedProduct.image_url} 
          onChange={handleImageChange} 
        />

        <ProductDetailsSection 
          product={editedProduct} 
          onChange={handleProductChange} 
        />
        
        <PricingDetailsSection 
          product={editedProduct} 
          onChange={handleProductChange} 
        />
        
        <InventoryDetailsSection 
          product={editedProduct} 
          units={units} 
          categories={[editedProduct.category].filter(Boolean) as string[]}
          onChange={handleProductChange} 
        />
      </div>

      <ProductFormActions 
        onCancel={onClose}
        onSubmit={handleSubmit}
        isSubmitting={updateProductMutation.isPending}
        isUploading={uploading}
      />
    </Card>
  );
};
