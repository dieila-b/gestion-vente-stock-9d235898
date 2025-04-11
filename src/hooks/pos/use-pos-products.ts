
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, Product } from '@/types/pos';
import { useState } from 'react';
import { isSelectQueryError } from '@/utils/supabase-helpers';

export function usePOSProducts(posLocationId: string, selectedCategory: string | null = null, searchTerm: string = '') {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20; // Number of products per page
  
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['pos-products', posLocationId, selectedCategory, searchTerm, currentPage],
    enabled: !!posLocationId && posLocationId !== '_all',
    queryFn: async () => {
      if (!posLocationId || posLocationId === '_all') {
        return [];
      }

      const { data, error } = await supabase
        .from('warehouse_stock')
        .select(`
          *,
          product:catalog(*),
          pos_location:pos_locations(*)
        `)
        .eq('pos_location_id', posLocationId)
        .gt('quantity', 0);

      if (error) throw error;
      return data || [];
    }
  });

  // Format products for use in the POS system
  const formattedProducts: CartItem[] = data.map(item => {
    // Get the product data from the join
    const productData = item.product;
    
    // Set defaults for product data if it's a SelectQueryError
    const defaultProduct = { 
      id: item.product_id || "unknown", 
      name: "Unknown Product", 
      reference: "", 
      category: "", 
      image_url: "" 
    };
    
    const safeProduct = isSelectQueryError(productData) ? defaultProduct : productData;
    
    return {
      id: item.product_id,
      name: safeProduct.name,
      quantity: 1, // Default quantity for cart
      price: item.unit_price, // Use unit_price from warehouse_stock
      stock: item.quantity,
      category: safeProduct.category,
      reference: safeProduct.reference,
      image_url: safeProduct.image_url,
    };
  });

  // Filter products based on search term and category
  const filteredProducts = formattedProducts.filter(product => {
    const matchesSearch = 
      !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.reference && product.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories from products
  const categories = Array.from(new Set(
    formattedProducts
      .map(product => product.category)
      .filter(Boolean)
  ));

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const refetchStock = () => refetch();

  return {
    products: paginatedProducts,
    categories,
    stockItems: data,
    isLoading,
    error,
    currentPage,
    totalPages,
    goToNextPage,
    goToPrevPage,
    refetchStock
  };
}
