
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/utils/db-adapter";

export function usePOSProducts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch all products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['pos-products'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('catalog')
          .select('id, name, reference, price, image_url, category, stock')
          .order('name');

        if (error) {
          throw error;
        }

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map(product => product.category).filter(Boolean))
        ) as string[];
        
        setCategories(uniqueCategories);
        
        return data || [];
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    }
  });

  // Filter products based on search query and category
  useEffect(() => {
    if (!products) return;

    let filtered = [...products];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        product => 
          product.name?.toLowerCase().includes(query) ||
          product.reference?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  // Reset category filter
  const resetCategoryFilter = () => {
    setSelectedCategory(null);
  };

  // Reset search query
  const resetSearchQuery = () => {
    setSearchQuery("");
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  return {
    products: filteredProducts,
    allProducts: products,
    isLoading,
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory,
    resetCategoryFilter,
    resetSearchQuery,
    resetAllFilters
  };
}
