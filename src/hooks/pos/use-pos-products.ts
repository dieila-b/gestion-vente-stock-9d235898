
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePOSProducts(selectedPDV: string) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Get products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['pos-products'],
    queryFn: async () => {
      console.log('Fetching products...');
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      console.log('Products fetched:', data?.length || 0);
      return data || [];
    }
  });

  // Get categories from products
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return {
    products: filteredProducts,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isLoading: productsLoading
  };
}
