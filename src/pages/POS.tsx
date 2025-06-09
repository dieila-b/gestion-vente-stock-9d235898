
import { CartContainer as Cart } from "@/components/pos/cart/CartContainer";
import { PaymentDialog } from "@/components/pos/PaymentDialog";
import { ProductSection } from "@/components/pos/ProductSection";
import { usePOS } from "@/hooks/use-pos";
import useEditOrder from "@/hooks/use-edit-order";
import { Product, CartItem as POSCartItem } from "@/types/pos";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
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
    currentProducts,
    categories,
    posLocations,
    selectedPDV,
    setSelectedPDV,
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

  // Nouvelle fonction pour gérer la modification du client
  const handleClientChange = (client: Client) => {
    setSelectedClient(client);
    toast.success("Client modifié avec succès");
  };

  // Nouvelle fonction pour gérer la suppression du client
  const handleClearClient = () => {
    setSelectedClient(null as any);
    toast.success("Client supprimé du panier");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Content - Grid layout responsive */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2">
          {/* Section des produits */}
          <div className="flex flex-col border-r">
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
              selectedClient={selectedClient}
              setSelectedClient={(client: Client) => setSelectedClient(client as any)}
            />
          </div>

          {/* Section panier avec nouvelles fonctionnalités */}
          <div className="flex flex-col">
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
    </div>
  );
}
