
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Cart } from "@/components/pos/Cart";
import { PaymentDialog } from "@/components/pos/PaymentDialog";
import { ClientSelect } from "@/components/pos/ClientSelect";
import { ProductSection } from "@/components/pos/ProductSection";
import { usePOS } from "@/hooks/use-pos";
import useEditOrder from "@/hooks/use-edit-order";
import { Product, CartItem as POSCartItem } from "@/types/pos";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Client } from "@/types/client_unified";
import { toast } from "sonner";

export default function POS() {
  const [searchParams] = useSearchParams();
  const editOrderId = searchParams.get('editOrder');

  const {
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
    isLoading,
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
  } = usePOS(editOrderId);

  // Get edit order data
  const editOrderData = useEditOrder();

  // Load data from edit order if available
  useEffect(() => {
    if (editOrderData && !editOrderData.isLoading && editOrderData.selectedClient) {
      setSelectedClient(editOrderData.selectedClient as any);
      if (editOrderData.cart && editOrderData.cart.length > 0) {
        setCart(editOrderData.cart as POSCartItem[]);
      }
    }
  }, [editOrderData, setSelectedClient, setCart]);

  // Initialize available stock from product stock
  useEffect(() => {
    currentProducts.forEach(product => {
      if (availableStock[product.id] === undefined) {
        updateAvailableStock(product.id, product.stock || 0);
      }
    });
  }, [currentProducts, availableStock, updateAvailableStock]);

  const handleAddToCart = (product: Product) => {
    // Vérifier le stock disponible avant d'ajouter
    const stockItem = stockItems.find(item => item.product_id === product.id);
    const currentStock = stockItem ? stockItem.quantity : product.stock || 0;
    
    if (currentStock <= 0) {
      toast.error("Produit en rupture de stock");
      return;
    }
    
    addToCart(product, currentStock);
  };

  // Handle product discount update to match expected function signature
  const handleUpdateDiscount = (productId: string, discount: number) => {
    updateDiscount(productId, discount);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden">
        <ProductSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedPDV={selectedPDV}
          setSelectedPDV={setSelectedPDV}
          posLocations={posLocations}
          currentProducts={currentProducts}
          categories={categories}
          currentPage={currentPage}
          totalPages={totalPages}
          goToPrevPage={goToPrevPage}
          goToNextPage={goToNextPage}
          onAddToCart={handleAddToCart}
          availableStock={availableStock}
        />

        <div className="w-full md:w-[55%] lg:w-[55%] border-l border-border/10 flex flex-col h-full overflow-hidden">
          <div className="flex-shrink-0 p-4 space-y-4 bg-background border-b border-border/10">
            <div className="flex flex-col space-y-2">
              {!selectedClient && (
                <div className="flex items-center text-red-500 text-sm mb-2">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>Veuillez sélectionner un client pour pouvoir effectuer une vente</span>
                </div>
              )}
              <ClientSelect
                selectedClient={selectedClient}
                onClientSelect={(client: Client) => setSelectedClient(client as any)}
              />
            </div>
          </div>
          
          <div className="flex-1 min-h-0 overflow-hidden relative">
            <Cart
              items={cart}
              onRemove={removeFromCart}
              onUpdateQuantity={(productId, delta) => {
                updateQuantity(productId, delta);
              }}
              onUpdateDiscount={handleUpdateDiscount}
              subtotal={calculateSubtotal()}
              total={calculateTotal()}
              totalDiscount={calculateTotalDiscount()}
              onCheckout={() => setIsPaymentDialogOpen(true)}
              isLoading={isLoading}
              selectedClient={selectedClient}
              clearCart={clearCart}
              onSetQuantity={setQuantity}
              availableStock={availableStock}
            />
          </div>
        </div>
      </div>

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        totalAmount={calculateTotal()}
        onSubmitPayment={handlePayment}
        items={cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity
        }))}
        fullyDeliveredByDefault={true}
      />
    </DashboardLayout>
  );
}
