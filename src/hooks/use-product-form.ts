
import { useState, useEffect } from "react";
import { CatalogProduct } from "@/types/catalog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const defaultProduct: Omit<CatalogProduct, 'id'> = {
  name: "",
  description: "",
  price: 0,
  purchase_price: 0,
  category: "",
  stock: 0,
  reference: "",
  created_at: new Date().toISOString(),
  unit_id: undefined,
  image_url: undefined
};

export const useProductForm = (isOpen: boolean) => {
  const [product, setProduct] = useState<Omit<CatalogProduct, 'id'>>(defaultProduct);
  const [uploading, setUploading] = useState(false);

  // Load categories from the database
  const { data: categories = [] } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('category')
        .not('category', 'is', null)
        .order('category');

      if (error) {
        toast.error("Erreur lors du chargement des catégories");
        throw error;
      }

      const uniqueCategories = Array.from(new Set(data.map(item => item.category))).filter(Boolean);
      return uniqueCategories;
    }
  });

  // Generate a reference number when the form opens
  useEffect(() => {
    if (isOpen) {
      const date = new Date();
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const reference = `PRD${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${randomNum}`;
      setProduct({ ...defaultProduct, reference });
    }
  }, [isOpen]);

  // Update product state
  const updateProduct = (newProductData: Partial<Omit<CatalogProduct, 'id'>>) => {
    setProduct(prev => ({
      ...prev,
      ...newProductData
    }));
  };

  // Handle image upload status
  const setUploadingStatus = (status: boolean) => {
    setUploading(status);
  };

  // Reset form
  const resetForm = () => {
    setProduct(defaultProduct);
  };

  // Validate product data
  const validateProduct = (): boolean => {
    if (!product.name || !product.price) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return false;
    }
    return true;
  };

  return {
    product,
    uploading,
    categories,
    updateProduct,
    setUploadingStatus,
    resetForm,
    validateProduct
  };
};
