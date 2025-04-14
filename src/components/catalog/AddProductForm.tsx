
import { Card } from "@/components/ui/card";
import { UseMutationResult } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";
import { CatalogProduct } from "@/types/catalog";
import { useProductUnits } from "@/hooks/use-product-units";
import { useProductForm } from "@/hooks/use-product-form";
import { ImageUploadSection } from "./product-form/ImageUploadSection";
import { ProductDetailsSection } from "./product-form/ProductDetailsSection";
import { PricingDetailsSection } from "./product-form/PricingDetailsSection";
import { InventoryDetailsSection } from "./product-form/InventoryDetailsSection";
import { ProductFormActions } from "./product-form/ProductFormActions";

interface AddProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  addProductMutation: UseMutationResult<any, PostgrestError, Omit<CatalogProduct, 'id'>, unknown>;
}

export const AddProductForm = ({ isOpen, onClose, addProductMutation }: AddProductFormProps) => {
  const { units, isLoading: unitsLoading } = useProductUnits();
  const { 
    product, 
    uploading, 
    categories, 
    updateProduct, 
    setUploadingStatus, 
    resetForm, 
    validateProduct 
  } = useProductForm(isOpen);

  const handleImageChange = (url: string) => {
    updateProduct({ image_url: url });
  };

  const handleSubmit = async () => {
    if (!validateProduct()) return;

    try {
      await addProductMutation.mutateAsync(product);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 enhanced-glass animate-in fade-in zoom-in">
        <h2 className="text-2xl font-bold mb-6 text-gradient">Nouveau Produit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUploadSection 
            value={product.image_url} 
            onChange={handleImageChange} 
          />

          <ProductDetailsSection 
            product={product} 
            onChange={updateProduct} 
          />
          
          <PricingDetailsSection 
            product={product} 
            onChange={updateProduct} 
          />
          
          <InventoryDetailsSection 
            product={product} 
            units={units} 
            categories={categories}
            onChange={updateProduct} 
          />
        </div>

        <ProductFormActions 
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={addProductMutation.isPending}
          isUploading={uploading}
        />
      </Card>
    </div>
  );
};
