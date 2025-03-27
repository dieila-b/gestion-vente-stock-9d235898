
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Cart } from "@/components/pos/Cart";
import { PaymentDialog } from "@/components/pos/PaymentDialog";
import { ClientSelect } from "@/components/pos/ClientSelect";
import { ProductSection } from "@/components/pos/ProductSection";
import { usePOS } from "@/hooks/use-pos";
import { useEditOrder } from "@/hooks/use-edit-order";
import { Product } from "@/types/pos";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

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

  // Load data from edit order if available
  useEditOrder(setSelectedClient, setCart);

  // Initialize available stock from product stock
  useEffect(() => {
    currentProducts.forEach(product => {
      if (availableStock[product.id] === undefined) {
        updateAvailableStock(product.id, product.stock || 0);
      }
    });
  }, [currentProducts, availableStock, updateAvailableStock]);

  const handleAddToCart = (product: Product) => {
    // Pass the current stock when adding to cart
    const stockItem = stockItems.find(item => item.product_id === product.id);
    const currentStock = stockItem ? stockItem.quantity : product.stock || 0;
    
    addToCart(product, currentStock);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-background">
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

        <div className="w-full md:w-[55%] lg:w-[55%] border-l border-border/10 flex flex-col overflow-hidden">
          <div className="p-4 space-y-4">
            <div className="flex flex-col space-y-2">
              {!selectedClient && (
                <div className="flex items-center text-red-500 text-sm mb-2">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>Veuillez sélectionner un client pour pouvoir effectuer une vente</span>
                </div>
              )}
              <ClientSelect
                selectedClient={selectedClient}
                onSelectClient={setSelectedClient}
              />
            </div>
            
            <Cart
              items={cart}
              onRemove={removeFromCart}
              onUpdateQuantity={(productId, delta) => {
                const item = cart.find(item => item.id === productId);
                if (item) {
                  updateQuantity(productId, delta);
                }
              }}
              onUpdateDiscount={updateDiscount}
              subtotal={calculateSubtotal()}
              total={calculateTotal()}
              totalDiscount={calculateTotalDiscount()}
              onCheckout={() => setIsPaymentDialogOpen(true)}
              isLoading={isLoading}
              selectedClient={selectedClient}
              clearCart={clearCart}
              onSetQuantity={setQuantity}
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
