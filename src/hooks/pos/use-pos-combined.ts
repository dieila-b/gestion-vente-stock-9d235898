
import { useState, useEffect } from "react";
import { usePOSProducts } from "./use-pos-products";
import { CartItem } from "@/types/pos";

/**
 * A hook that combines products from different sources
 */
export function usePOSCombined(posLocationId: string, selectedCategory: string | null = null, searchTerm: string = '') {
  const [combinedProducts, setCombinedProducts] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get products from main POS system
  const {
    products,
    categories,
    stockItems,
    isLoading: productsLoading,
    error: productsError,
    currentPage,
    totalPages,
    goToNextPage,
    goToPrevPage,
    refetchStock
  } = usePOSProducts(posLocationId, selectedCategory, searchTerm);

  // Combine products and handle loading states
  useEffect(() => {
    setIsLoading(productsLoading);
    
    if (productsError) {
      setError(productsError as Error);
    } else {
      setError(null);
    }
    
    // Update combined products when source products change
    setCombinedProducts(products);
  }, [products, productsLoading, productsError]);

  return {
    products: combinedProducts,
    categories,
    stockItems,
    isLoading,
    error,
    currentPage,
    totalPages,
    goToNextPage,
    goToPrevPage,
    refetchStock
  };
}
