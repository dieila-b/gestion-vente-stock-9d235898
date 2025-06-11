
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";
import { useQuery } from "@tanstack/react-query";
import { usePOSProducts } from "./pos/use-pos-products";
import { usePOSLocations } from "./pos/use-pos-locations";
import { usePOSPayment } from "./pos/payment";
import { CartItem } from "@/types/pos";

export function usePOS(editOrderId?: string | null) {
  // Cart state from zustand store
  const { 
    cart, 
    addItem, 
    removeItem, 
    updateQuantity, 
    updateDiscount,
    clearCart, 
    setCart: storeSetCart,
    addClient,
    removeClient,
    setQuantity: storeSetQuantity
  } = useCartStore();

  // Client selection state
  const [selectedClient, setSelectedClient] = useState<Client | null>(cart.client);
  
  // POS location state and data
  const { 
    posLocations, 
    selectedPDV, 
    setSelectedPDV, 
    activeRegister,
    isLoading: locationsLoading 
  } = usePOSLocations();
  
  const [availableStock, setAvailableStock] = useState<Record<string, number>>({});

  // Get products with usePOSProducts hook
  const { 
    products, 
    categories, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery,
    isLoading: productsLoading 
  } = usePOSProducts(selectedPDV);
  
  // Payment dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Create stock items state
  const [stockItems, setStockItems] = useState<any[]>([]);
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil((products?.length || 0) / itemsPerPage);
  
  // Get current products
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products?.slice(indexOfFirstProduct, indexOfLastProduct) || [];
  
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
        console.log('Fetching stock for PDV:', selectedPDV);
        const { data, error } = await supabase
          .from('warehouse_stock')
          .select('*')
          .eq('pos_location_id', selectedPDV);
        
        if (error) throw error;
        
        console.log('Stock items fetched:', data?.length || 0);
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

  // Fonction setQuantity qui remplace directement la quantité
  const setQuantity = (productId: string, quantity: number) => {
    storeSetQuantity(productId, quantity);
  };

  // Custom wrapper for setCart to ensure types are consistent
  const setCart = (items: CartItem[]) => {
    const completeItems = items.map(item => ({
      ...item,
      product_id: item.product_id || item.id,
      category: item.category || '',
      subtotal: item.price * item.quantity
    }));
    storeSetCart(completeItems);
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
    activeRegister,
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

  // Combined loading state
  const isAppLoading = locationsLoading || productsLoading;

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
    selectedCategory,
    setSelectedCategory,
    searchTerm: searchQuery,
    setSearchTerm: setSearchQuery,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    isLoading: isAppLoading || isLoading,
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
    refetchStock
  };
}
