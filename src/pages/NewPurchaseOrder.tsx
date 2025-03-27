
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderInfoForm } from "@/components/purchases/order-form/OrderInfoForm";
import { ProductsSection } from "@/components/purchases/order-form/ProductsSection";
import { NotesSection } from "@/components/purchases/order-form/NotesSection";
import { OrderPriceSection } from "@/components/suppliers/order-form/OrderPriceSection";
import { OrderSummarySection } from "@/components/purchases/order-form/OrderSummarySection";
import { usePurchaseOrderForm } from "@/hooks/purchases/use-purchase-order-form";
import { useNavigate } from "react-router-dom";

const NewPurchaseOrder = () => {
  const navigate = useNavigate();
  const {
    // Form state
    supplier,
    setSupplier,
    orderNumber,
    setOrderNumber,
    deliveryDate,
    setDeliveryDate,
    warehouseId,
    setWarehouseId,
    notes,
    setNotes,
    
    // Price state
    taxRate,
    setTaxRate,
    logisticsCost,
    setLogisticsCost,
    transitCost,
    setTransitCost,
    discount,
    setDiscount,
    shippingCost,
    setShippingCost,
    
    // Calculations
    calculateSubtotal,
    calculateTax,
    calculateTotalTTC,
    
    // Form submission
    handleSubmit,
    isSubmitting,
    
    // Product selection
    productSelection
  } = usePurchaseOrderForm();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nouveau bon de commande</h1>
        <Button variant="outline" onClick={() => navigate("/purchase-orders")}>
          Retour
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informations du bon de commande</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <OrderInfoForm 
              orderNumber={orderNumber}
              setOrderNumber={setOrderNumber}
              supplier={supplier}
              setSupplier={setSupplier}
              deliveryDate={deliveryDate}
              setDeliveryDate={setDeliveryDate}
              warehouseId={warehouseId}
              setWarehouseId={setWarehouseId}
            />
            
            <ProductsSection 
              orderItems={productSelection.orderItems}
              showProductModal={productSelection.showProductModal}
              setShowProductModal={productSelection.setShowProductModal}
              searchQuery={productSelection.searchQuery}
              setSearchQuery={productSelection.setSearchQuery}
              filteredProducts={productSelection.filteredProducts}
              addProductToOrder={productSelection.addProductToOrder}
              removeProductFromOrder={productSelection.removeProductFromOrder}
              updateProductQuantity={productSelection.updateProductQuantity}
              updateProductPrice={productSelection.updateProductPrice}
              calculateTotal={productSelection.calculateTotal}
            />
            
            <OrderPriceSection
              discount={discount}
              shippingCost={shippingCost}
              logisticsCost={logisticsCost}
              transitCost={transitCost}
              taxRate={taxRate}
              onDiscountChange={setDiscount}
              onShippingCostChange={setShippingCost}
              onLogisticsCostChange={setLogisticsCost}
              onTransitCostChange={setTransitCost}
              onTaxRateChange={setTaxRate}
              subtotal={calculateSubtotal()}
              tax={calculateTax()}
              total={calculateTotalTTC()}
              formatPrice={formatPrice}
            />
            
            <OrderSummarySection 
              subtotal={calculateSubtotal()}
              tax={calculateTax()}
              total={calculateTotalTTC()}
            />
            
            <NotesSection 
              notes={notes}
              setNotes={setNotes}
            />
            
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/purchase-orders")}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !supplier}
              >
                {isSubmitting ? "Création en cours..." : "Créer le bon de commande"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewPurchaseOrder;
