
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";
import { useQuery } from "@tanstack/react-query";
import { usePOSProducts } from "./use-pos-products";
import { usePOSPayment } from "./payment";

export function usePOSCombined(editOrderId?: string | null) {
  // Cart state from zustand store
  const { 
    cart, 
    addItem, 
    removeItem, 
    updateQuantity, 
    updateDiscount,
    clearCart, 
    setCart,
    addClient,
    removeClient
  } = useCartStore();

  // Client selection state
  const [selectedClient, setSelectedClient] = useState<Client | null>(cart.client);
  
  // POS location state
  const [selectedPDV, setSelectedPDV] = useState<string>("");
  const [availableStock, setAvailableStock] = useState<Record<string, number>>({});

  // Get POS locations
  const { data: posLocations = [] } = useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pos_locations').select('*');
      if (error) throw error;
      return data;
    }
  });

  // Set default POS location if none selected
  useEffect(() => {
    if (!selectedPDV && posLocations.length > 0) {
      setSelectedPDV(posLocations[0].id);
    }
  }, [posLocations, selectedPDV]);

  // Get products with usePOSProducts hook
  const productsData = usePOSProducts();
  
  // Payment dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Create stock items state
  const [stockItems, setStockItems] = useState<any[]>([]);
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil((productsData.products?.length || 0) / itemsPerPage);
  
  // Get current products
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = productsData.products?.slice(indexOfFirstProduct, indexOfLastProduct) || [];
  
  // Pagination functions
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

  // Fetch stock items whenever the selected POS location changes
  useEffect(() => {
    const fetchStockItems = async () => {
      if (!selectedPDV) return;
      
      try {
        const { data, error } = await supabase
          .from('warehouse_stock')
          .select('*')
          .eq('pos_location_id', selectedPDV);
        
        if (error) throw error;
        setStockItems(data || []);
        
        // Update available stock
        const stockMap: Record<string, number> = {};
        data?.forEach((item: any) => {
          if (item.product_id && item.quantity !== undefined) {
            stockMap[item.product_id] = item.quantity;
          }
        });
        setAvailableStock(stockMap);
      } catch (error) {
        console.error('Error fetching stock:', error);
      }
    };
    
    fetchStockItems();
  }, [selectedPDV]);

  // Convenience function to update available stock
  const updateAvailableStock = (productId: string, quantity: number) => {
    setAvailableStock(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  // Refetch stock items
  const refetchStock = async () => {
    if (!selectedPDV) return;
    
    try {
      const { data, error } = await supabase
        .from('warehouse_stock')
        .select('*')
        .eq('pos_location_id', selectedPDV);
      
      if (error) throw error;
      setStockItems(data || []);
      
      // Update available stock
      const stockMap: Record<string, number> = {};
      data?.forEach((item: any) => {
        if (item.product_id && item.quantity !== undefined) {
          stockMap[item.product_id] = item.quantity;
        }
      });
      setAvailableStock(stockMap);
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  };

  // Set quantity manually
  const setQuantity = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  // Use the payment hook
  const { handlePayment } = usePOSPayment({
    selectedClient,
    cart: cart.items,
    calculateTotal: () => cart.total,
    calculateSubtotal: () => cart.subtotal,
    calculateTotalDiscount: () => cart.discount,
    clearCart,
    stockItems,
    selectedPDV,
    activeRegister: null, // This would come from a hook or context
    refetchStock,
    editOrderId
  });

  // Sync cart client with selectedClient
  useEffect(() => {
    if (selectedClient) {
      addClient(selectedClient);
    }
  }, [selectedClient, addClient]);

  // Effect to update client state from cart
  useEffect(() => {
    if (cart.client) {
      setSelectedClient(cart.client);
    }
  }, [cart.client]);

  return {
    // Cart state
    cart: cart.items,
    addToCart: addItem,
    removeFromCart: removeItem,
    updateQuantity,
    updateDiscount,
    calculateSubtotal: () => cart.subtotal,
    calculateTotal: () => cart.total,
    calculateTotalDiscount: () => cart.discount,
    clearCart,
    setCart,
    availableStock,
    updateAvailableStock,
    setQuantity,

    // UI state
    selectedClient,
    setSelectedClient,
    selectedCategory: productsData.selectedCategory,
    setSelectedCategory: productsData.setSelectedCategory,
    searchTerm: productsData.searchQuery,
    setSearchTerm: productsData.setSearchQuery,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    isLoading,
    currentPage,
    totalPages,
    
    // Products and filtering
    currentProducts,
    categories: productsData.categories,
    
    // POS/Location data
    posLocations,
    selectedPDV,
    setSelectedPDV,
    
    // Actions
    handlePayment,
    goToNextPage,
    goToPrevPage,
    stockItems,
    refetchStock
  };
}
