
import { useState, useEffect } from "react";
import { usePOSProducts } from "./pos/use-pos-products";
import { usePOSLocations } from "./pos/use-pos-locations";
import { usePOSRealtime } from "./pos/use-pos-realtime";
// Import from our new folder structure
import { usePOSPayment } from "./pos/payment";
import { useCart } from "./use-cart";
import { Client } from "@/types/client";

export function usePOS(editOrderId?: string | null) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPDV, setSelectedPDV] = useState("_all");

  // Use the cart hook for managing cart items
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateDiscount,
    calculateSubtotal,
    calculateTotal,
    calculateTotalDiscount,
    clearCart,
    setCart,
    availableStock,
    updateAvailableStock,
    getAvailableStock,
    setQuantity
  } = useCart();

  // Use the products hook for fetching and filtering products
  const posProductsResult = usePOSProducts(selectedPDV);
  const {
    products,
    categories,
    stockItems,
    isLoading: productsLoading,
    currentPage,
    totalPages,
    goToNextPage,
    goToPrevPage,
    refetchStock
  } = posProductsResult;

  // Use the locations hook for fetching POS locations
  const { posLocations, activeRegister } = usePOSLocations();

  // Use the payment hook for handling payment and order creation
  const {
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    isLoading: paymentLoading,
    handlePayment
  } = usePOSPayment({
    selectedClient,
    cart,
    calculateTotal,
    calculateSubtotal,
    calculateTotalDiscount,
    clearCart,
    stockItems,
    selectedPDV,
    activeRegister,
    refetchStock,
    editOrderId
  });

  // Filter products for display
  const currentProducts = usePOSRealtime(products);

  // Reset the selected category when switching POS
  useEffect(() => {
    setSelectedCategory(null);
  }, [selectedPDV]);

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
    clearCart,
    setCart,
    availableStock,
    updateAvailableStock,
    getAvailableStock,
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
    isLoading: productsLoading || paymentLoading,
    currentPage,
    totalPages,
    
    // Products and filtering
    currentProducts,
    categories,
    stockItems,
    
    // POS/Location data
    posLocations,
    selectedPDV,
    setSelectedPDV,
    
    // Actions
    handlePayment,
    goToNextPage,
    goToPrevPage,
    refetchStock
  };
}
