
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/pos";
import { isSelectQueryError } from "@/utils/supabase-helpers";

export function usePOSProducts(selectedPDV: string, selectedCategory: string | null, searchTerm: string) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  // Get stock items for the selected POS location
  const { data: stockItems = [], refetch: refetchStock, isLoading } = useQuery({
    queryKey: ['pos-stock', selectedPDV, selectedCategory, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('warehouse_stock')
        .select(`
          *,
          product:catalog(*),
          pos_location:pos_locations(*)
        `)
        .is('warehouse_id', null);

      if (selectedPDV !== "_all") {
        query = query.eq('pos_location_id', selectedPDV);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    }
  });

  // Convert stock items to products for the UI, properly handling SelectQueryError
  const products = stockItems.map(item => {
    // Create default product values
    const defaultProduct = {
      id: item.product_id,
      name: "Unknown Product",
      stock: item.quantity,
      price: item.unit_price || 0
    };

    // Check if product is a SelectQueryError
    if (isSelectQueryError(item.product)) {
      return defaultProduct;
    }

    // Return the product with fallbacks
    return {
      ...(item.product || {}),
      stock: item.quantity,
      price: (item.product && !isSelectQueryError(item.product) && item.product.price) || item.unit_price || 0
    };
  });

  // Filter products based on search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  
  // Extract categories
  const categories = Array.from(new Set(products.map(product => product.category))).filter(Boolean);

  // Pagination controls
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  return {
    products,
    stockItems,
    refetchStock,
    currentProducts,
    categories,
    currentPage,
    totalPages,
    isLoading,
    goToNextPage,
    goToPrevPage,
  };
}
