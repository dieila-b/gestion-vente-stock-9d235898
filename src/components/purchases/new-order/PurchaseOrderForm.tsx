
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Package } from "lucide-react";
import { useSuppliers } from "@/hooks/use-suppliers";
import { usePurchaseOrderFormState } from "./usePurchaseOrderFormState";
import { usePurchaseOrderSubmit } from "./usePurchaseOrderSubmit";
import { useProductSelection } from "@/hooks/use-product-selection";
import { ProductSelectionModal } from "./ProductSelectionModal";

// Import the new component sections
import { SupplierDateSection } from "./components/SupplierDateSection";
import { StatusSection } from "./components/StatusSection";
import { ProductsSection } from "./components/ProductsSection";
import { AdditionalCostsSection } from "./components/AdditionalCostsSection";
import { PaymentCounterSection } from "./components/PaymentCounterSection";
import { NotesSection } from "./components/NotesSection";
import { FormActions } from "./components/FormActions";

const PurchaseOrderForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliers();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product selection logic
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

  // Form state from custom hook
  const { 
    supplier, setSupplier,
    orderNumber, setOrderNumber,
    deliveryDate, setDeliveryDate,
    notes, setNotes,
    taxRate, setTaxRate,
    logisticsCost, setLogisticsCost,
    transitCost, setTransitCost,
    discount, setDiscount,
    shippingCost, setShippingCost,
    orderStatus, setOrderStatus,
    paymentStatus, setPaymentStatus,
    paidAmount, setPaidAmount,
  } = usePurchaseOrderFormState();
  
  // Form submission handling with custom hook
  const { 
    handleSubmit: submitOrder,
    calculateSubtotal,
    calculateTax,
    calculateTotalTTC,
    calculateRemainingAmount,
    formatPrice 
  } = usePurchaseOrderSubmit({
    supplier,
    orderNumber,
    deliveryDate,
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
    setIsSubmitting,
    toast,
    navigate
  });

  // Calculate total values
  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotalTTC();
  const remainingAmount = calculateRemainingAmount();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission initiated with:", {
      supplier,
      orderItems: orderItems.length,
      orderNumber,
      total
    });
    
    if (!supplier) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fournisseur",
        variant: "destructive"
      });
      return;
    }
    
    if (orderItems.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit",
        variant: "destructive"
      });
      return;
    }
    
    submitOrder(e);
  };

  // Helper function to convert string date to Date object and vice versa
  const handleDateChange = (date: Date | undefined) => {
    setDeliveryDate(date ? date.toISOString().split('T')[0] : '');
  };

  const currentDeliveryDate = deliveryDate ? new Date(deliveryDate) : undefined;

  // Check if form is valid
  const isFormValid = supplier && orderItems.length > 0;

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-black/20 text-white">
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="text-gradient flex items-center gap-2">
              <Package className="h-6 w-6" />
              Nouvelle Commande Fournisseur
            </CardTitle>
            <p className="text-white/60">Créez une nouvelle commande pour Ender</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Supplier and delivery date */}
            <SupplierDateSection 
              supplier={supplier}
              setSupplier={setSupplier}
              deliveryDate={currentDeliveryDate}
              setDeliveryDate={handleDateChange}
              suppliers={suppliers}
            />

            {/* Payment and order status */}
            <StatusSection 
              paymentStatus={paymentStatus}
              setPaymentStatus={setPaymentStatus}
              orderStatus={orderStatus}
              setOrderStatus={setOrderStatus}
            />

            {/* Products */}
            <ProductsSection 
              orderItems={orderItems}
              removeProductFromOrder={removeProductFromOrder}
              updateProductQuantity={updateProductQuantity}
              updateProductPrice={updateProductPrice}
              calculateTotal={calculateTotal}
              setShowProductModal={setShowProductModal}
            />

            {/* Additional costs */}
            <AdditionalCostsSection 
              discount={discount}
              setDiscount={setDiscount}
              shippingCost={shippingCost}
              setShippingCost={setShippingCost}
              logisticsCost={logisticsCost}
              setLogisticsCost={setLogisticsCost}
              transitCost={transitCost}
              setTransitCost={setTransitCost}
              taxRate={taxRate}
              setTaxRate={setTaxRate}
              subtotal={subtotal}
              tax={tax}
              total={total}
              formatPrice={formatPrice}
            />

            {/* Payment counter */}
            <PaymentCounterSection 
              paidAmount={paidAmount}
              setPaidAmount={setPaidAmount}
              total={total}
              remainingAmount={remainingAmount}
              formatPrice={formatPrice}
            />

            {/* Notes */}
            <NotesSection 
              notes={notes}
              setNotes={setNotes}
            />

            {/* Submit buttons */}
            <FormActions 
              isSubmitting={isSubmitting}
              isValid={isFormValid}
              onCancel={() => navigate("/purchase-orders")}
            />
          </form>
        </CardContent>
      </Card>

      {/* Product selection modal */}
      <ProductSelectionModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        onAddProduct={addProductToOrder}
      />
    </div>
  );
};

export default PurchaseOrderForm;
