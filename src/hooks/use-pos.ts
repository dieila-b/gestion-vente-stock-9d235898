
import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product, CartItem as POSCartItem } from "@/types/pos";
import { Client } from "@/types/client";
import { toast } from "sonner";
import { usePOSCombined } from "./pos/use-pos-combined";
import { usePOSPayment } from "./pos/payment";
import { usePOSLocations } from "./pos/use-pos-locations";

const ITEMS_PER_PAGE = 12;

export function usePOS(editOrderId?: string | null) {
  const queryClient = useQueryClient();
  
  // Cart state using Zustand
  const {
    cart,
    addToCart: addToCartAction,
    removeFromCart,
    updateQuantity,
    updateDiscount,
    calculateSubtotal,
    calculateTotal,
    calculateTotalDiscount,
    clearCart: clearCartAction,
    setCart,
    selectedClient,
    setSelectedClient
  } = usePOSCombined();

  // Wrapper pour clearCart avec logs
  const clearCart = useCallback(() => {
    console.log('=== usePOS clearCart wrapper appelé ===');
    console.log('Cart avant clearCart:', cart);
    clearCartAction();
    console.log('=== clearCart wrapper terminé ===');
  }, [clearCartAction, cart]);

  // Stock management
  const [availableStock, setAvailableStock] = useState<Record<string, number>>({});
  
  // UI state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // POS Locations
  const { 
    posLocations, 
    selectedPDV, 
    setSelectedPDV,
    activeRegister 
  } = usePOSLocations();

  // Stock items query
  const { data: stockItems = [] } = useQuery({
    queryKey: ['warehouse-stock', selectedPDV],
    queryFn: async () => {
      let query = supabase
        .from('warehouse_stock')
        .select(`
          *,
          catalog:product_id (
            id,
            name,
            price,
            category,
            reference,
            image_url
          ),
          warehouses:warehouse_id (
            id,
            name
          ),
          pos_locations:pos_location_id (
            id,
            name
          )
        `)
        .gt('quantity', 0);

      if (selectedPDV && selectedPDV !== "_all") {
        query = query.eq('pos_location_id', selectedPDV);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Products query
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Categories
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Payment handling
  const { 
    isPaymentDialogOpen, 
    setIsPaymentDialogOpen, 
    isLoading, 
    handlePayment 
  } = usePOSPayment({
    selectedClient,
    cart,
    calculateTotal,
    calculateSubtotal,
    calculateTotalDiscount,
    clearCart, // Utilise notre wrapper avec logs
    stockItems,
    selectedPDV,
    activeRegister,
    refetchStock: () => queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] }),
    editOrderId
  });

  // Add to cart with stock validation
  const addToCart = useCallback((product: Product, maxStock: number) => {
    const existingItem = cart.find(item => item.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    
    if (currentQuantity >= maxStock) {
      toast.error("Stock insuffisant");
      return;
    }
    
    addToCartAction(product);
  }, [cart, addToCartAction]);

  // Stock management functions
  const updateAvailableStock = useCallback((productId: string, stock: number) => {
    setAvailableStock(prev => ({
      ...prev,
      [productId]: stock
    }));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const stockItem = stockItems.find(item => item.product_id === productId);
    const maxStock = stockItem ? stockItem.quantity : 0;
    
    if (quantity > maxStock) {
      toast.error("Quantité supérieure au stock disponible");
      return;
    }
    
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    // Update quantity by calculating the difference
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      const delta = quantity - existingItem.quantity;
      updateQuantity(productId, delta);
    }
  }, [cart, stockItems, removeFromCart, updateQuantity]);

  // Navigation
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  return {
    // Cart state
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateDiscount,
    calculateSubtotal,
    calculateTotal,
    calculateTotalDiscount,
    clearCart, // Notre wrapper avec logs
    setCart,
    availableStock,
    updateAvailableStock,
    setQuantity,

    // UI state
    selectedClient,
    setSelectedClient,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    isLoading: isLoading || isLoadingProducts,
    currentPage,
    totalPages,
    
    // Products and filtering
    currentProducts,
    categories,
    
    // POS/Location data
    posLocations,
    selectedPDV,
    setSelectedPDV,
    
    // Actions
    handlePayment,
    goToNextPage,
    goToPrevPage,
    stockItems,
  };
}
