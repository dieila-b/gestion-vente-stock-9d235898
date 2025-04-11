
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
  const posProducts = usePOSProducts(posLocationId, selectedCategory, searchTerm);

  // Combine products and handle loading states
  useEffect(() => {
    setIsLoading(posProducts.isLoading);
    
    if (posProducts.error) {
      setError(posProducts.error as Error);
    } else {
      setError(null);
    }
    
    // Update combined products when source products change
    setCombinedProducts(posProducts.products);
  }, [posProducts.products, posProducts.isLoading, posProducts.error]);

  return {
    products: combinedProducts,
    categories: posProducts.categories,
    stockItems: posProducts.stockItems,
    isLoading,
    error,
    currentPage: posProducts.currentPage,
    totalPages: posProducts.totalPages,
    goToNextPage: posProducts.goToNextPage,
    goToPrevPage: posProducts.goToPrevPage,
    refetchStock: posProducts.refetchStock
  };
}
