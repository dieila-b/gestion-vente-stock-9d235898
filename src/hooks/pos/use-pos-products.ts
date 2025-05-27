
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePOSProducts(selectedPDV?: string) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch products with stock for selected PDV
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['pos-products', selectedPDV],
    queryFn: async () => {
      try {
        if (!selectedPDV || selectedPDV === "_all") {
          // If no specific PDV selected, get all products from catalog
          const { data, error } = await supabase
            .from('catalog')
            .select('id, name, reference, price, image_url, category, stock')
            .order('name');

          if (error) {
            throw error;
          }

          console.log('Fetched catalog products:', data?.length || 0);
          
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(data?.map(product => product.category).filter(Boolean))
          ) as string[];
          
          setCategories(uniqueCategories);
          
          return data || [];
        } else {
          // Get products with stock for specific PDV
          const { data, error } = await supabase
            .from('warehouse_stock')
            .select(`
              id,
              quantity,
              product:product_id (
                id,
                name,
                reference,
                price,
                image_url,
                category,
                stock
              )
            `)
            .eq('pos_location_id', selectedPDV)
            .gt('quantity', 0); // Only products with stock > 0

          if (error) {
            console.error('Error fetching PDV products:', error);
            throw error;
          }

          console.log('Fetched PDV products:', data?.length || 0);

          // Transform the data to match expected format
          const transformedProducts = data?.map(item => ({
            id: item.product?.id,
            name: item.product?.name,
            reference: item.product?.reference,
            price: item.product?.price,
            image_url: item.product?.image_url,
            category: item.product?.category,
            stock: item.quantity, // Use stock from warehouse_stock
            product_id: item.product?.id
          })).filter(product => product.id) || [];

          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(transformedProducts.map(product => product.category).filter(Boolean))
          ) as string[];
          
          setCategories(uniqueCategories);
          
          return transformedProducts;
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    },
    enabled: true, // Always enabled, but behavior changes based on selectedPDV
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
