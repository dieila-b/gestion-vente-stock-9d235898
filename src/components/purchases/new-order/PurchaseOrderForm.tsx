
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { OrderInfoForm } from "@/components/purchases/order-form/OrderInfoForm";
import { ProductsSection } from "@/components/purchases/order-form/ProductsSection";
import { NotesSection } from "@/components/purchases/order-form/NotesSection";
import { useProductSelection } from "@/hooks/use-product-selection";
import { supabase } from "@/integrations/supabase/client";
import { OrderPriceSection } from "@/components/suppliers/order-form/OrderPriceSection";
import { OrderStatusSelect } from "@/components/suppliers/order-form/OrderStatusSelect";
import { PaymentStatusSelect } from "@/components/suppliers/order-form/PaymentStatusSelect";
import { PaymentSection } from "@/components/suppliers/order-form/PaymentSection";
import { usePurchaseOrderFormState } from "./usePurchaseOrderFormState";
import { usePurchaseOrderSubmit } from "./usePurchaseOrderSubmit";
import { PurchaseOrderHeader } from "./PurchaseOrderHeader";
import { PurchaseFormContent } from "./PurchaseFormContent";

const PurchaseOrderForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleCreate } = usePurchaseOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state from custom hook
  const { 
    supplier, setSupplier,
    orderNumber, setOrderNumber,
    deliveryDate, setDeliveryDate,
    warehouseId, setWarehouseId,
    notes, setNotes,
    taxRate, setTaxRate,
    logisticsCost, setLogisticsCost,
    transitCost, setTransitCost,
    discount, setDiscount,
    shippingCost, setShippingCost,
    orderStatus, setOrderStatus,
    paymentStatus, setPaymentStatus,
    paidAmount, setPaidAmount
  } = usePurchaseOrderFormState();
  
  // Products management with custom hook
  const {
    orderItems,
    setOrderItems,
    showProductModal,
    setShowProductModal,
    searchQuery,
    setSearchQuery,
    filteredProducts,
    addProductToOrder,
    removeProductFromOrder,
    updateProductQuantity,
    updateProductPrice,
    calculateTotal
  } = useProductSelection();

  // Form submission handling
  const { 
    handleSubmit,
    calculateSubtotal,
    calculateTax,
    calculateTotalTTC,
    calculateRemainingAmount,
    formatPrice 
  } = usePurchaseOrderSubmit({
    supplier,
    orderNumber,
    deliveryDate,
    warehouseId,
    notes,
    orderStatus,
    paymentStatus,
    paidAmount,
    logisticsCost,
    transitCost,
    taxRate,
    shippingCost,
    discount,
    orderItems,
    calculateTotal,
    setIsSubmitting,
    toast,
    handleCreate,
    navigate
  });

  return (
    <div className="container mx-auto py-8">
      <PurchaseOrderHeader navigate={navigate} />
      
      <Card>
        <CardHeader>
          <CardTitle>Informations du bon de commande</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PurchaseFormContent 
              orderNumber={orderNumber}
              setOrderNumber={setOrderNumber}
              supplier={supplier}
              setSupplier={setSupplier}
              deliveryDate={deliveryDate}
              setDeliveryDate={setDeliveryDate}
              warehouseId={warehouseId}
              setWarehouseId={setWarehouseId}
              paymentStatus={paymentStatus}
              setPaymentStatus={setPaymentStatus}
              orderStatus={orderStatus}
              setOrderStatus={setOrderStatus}
              orderItems={orderItems}
              showProductModal={showProductModal}
              setShowProductModal={setShowProductModal}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredProducts={filteredProducts}
              addProductToOrder={addProductToOrder}
              removeProductFromOrder={removeProductFromOrder}
              updateProductQuantity={updateProductQuantity}
              updateProductPrice={updateProductPrice}
              calculateTotal={calculateTotal}
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
              paidAmount={paidAmount}
              totalAmount={calculateTotalTTC()}
              remainingAmount={calculateRemainingAmount()}
              onPaidAmountChange={setPaidAmount}
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

export default PurchaseOrderForm;
