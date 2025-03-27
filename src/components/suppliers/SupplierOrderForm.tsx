
import { Card, CardContent } from "@/components/ui/card";
import type { Supplier } from "@/types/supplier";
import { SupplierFormHeader } from "./forms/SupplierFormHeader";
import { FormNotes } from "./forms/FormNotes";
import { FormActions } from "./forms/FormActions";
import { useSupplierOrderForm } from "./hooks/useSupplierOrderForm";
import { OrderDetailsSection } from "./order-form/OrderDetailsSection";
import { OrderProductSection } from "./order-form/OrderProductSection";
import { OrderPriceSection } from "./order-form/OrderPriceSection";
import { PaymentSection } from "./order-form/PaymentSection";
import { useToast } from "@/components/ui/use-toast";

interface SupplierOrderFormProps {
  supplier: Supplier;
  onClose: () => void;
}

export const SupplierOrderForm = ({ supplier, onClose }: SupplierOrderFormProps) => {
  const { toast } = useToast();
  
  const {
    selectedProducts,
    deliveryDate,
    notes,
    discount,
    shippingCost,
    logisticsCost,
    transitCost,
    taxRate,
    paymentStatus,
    orderStatus,
    paidAmount,
    isSubmitting,
    calculateSubTotal,
    calculateTax,
    calculateTotal,
    remainingAmount,
    handlePaidAmountChange,
    handleAddProduct,
    setSelectedProducts,
    setDeliveryDate,
    setNotes,
    setDiscount,
    setShippingCost,
    setLogisticsCost,
    setTransitCost,
    setTaxRate,
    setPaymentStatus,
    setOrderStatus,
    handleSubmit,
    formatPrice,
  } = useSupplierOrderForm({ 
    supplier, 
    onClose, 
    toast: { toast }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <Card className="neo-blur border-white/10 shadow-xl hover:shadow-white/5 transition-all duration-300">
        <SupplierFormHeader type="order" supplierName={supplier.name} />
        <CardContent className="space-y-6 relative backdrop-blur-3xl bg-gradient-to-b from-white/5 to-white/0">
          <OrderDetailsSection
            supplier={supplier}
            deliveryDate={deliveryDate}
            onDeliveryDateChange={setDeliveryDate}
            orderStatus={orderStatus}
            paymentStatus={paymentStatus}
            onOrderStatusChange={setOrderStatus}
            onPaymentStatusChange={setPaymentStatus}
          />

          <OrderProductSection
            products={selectedProducts}
            onAddProduct={handleAddProduct}
            onRemoveProduct={(productId) => setSelectedProducts(selectedProducts.filter(p => p.id !== productId))}
            onProductChange={setSelectedProducts}
            formatPrice={formatPrice}
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
            subtotal={calculateSubTotal()}
            tax={calculateTax()}
            total={calculateTotal()}
            formatPrice={formatPrice}
          />

          <PaymentSection
            paidAmount={paidAmount}
            totalAmount={calculateTotal()}
            remainingAmount={remainingAmount}
            onPaidAmountChange={handlePaidAmountChange}
            formatPrice={formatPrice}
          />

          <FormNotes value={notes} onChange={setNotes} />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          
          <FormActions
            onClose={onClose}
            isSubmitting={isSubmitting}
            submitLabel="Créer la commande"
          />
        </CardContent>
      </Card>
    </form>
  );
};
