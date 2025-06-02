import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductSelectionModal } from "./ProductSelectionModal";
import { CatalogDebugInfo } from "./CatalogDebugInfo";
import { SuppliersDebugInfo } from "./SuppliersDebugInfo";
import { useProductSelection } from "@/hooks/use-product-selection";
import { usePurchaseOrderSubmit } from "@/hooks/use-purchase-order-submit";
import { useSuppliers } from "@/hooks/use-suppliers";
import { SupplierDateSection } from "./components/SupplierDateSection";
import { StatusSection } from "./components/StatusSection";
import { ProductsSection } from "./components/ProductsSection";
import { AdditionalCostsSection } from "./components/AdditionalCostsSection";
import { PaymentCounterSection } from "./components/PaymentCounterSection";
import { NotesSection } from "./components/NotesSection";
import { FormActions } from "./components/FormActions";

export default function PurchaseOrderForm() {
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>();
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "partial" | "paid">("pending");
  const [orderStatus, setOrderStatus] = useState<"pending" | "delivered">("pending");
  const [paidAmount, setPaidAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [logisticsCost, setLogisticsCost] = useState(0);
  const [transitCost, setTransitCost] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  
  // Load suppliers data
  const { suppliers, isLoading: suppliersLoading, error: suppliersError } = useSuppliers();
  
  const {
    orderItems,
    showProductModal,
    setShowProductModal,
    addProductToOrder,
    removeProductFromOrder,
    updateProductQuantity,
    updateProductPrice,
    calculateTotal
  } = useProductSelection();

  const { submitPurchaseOrder, isSubmitting } = usePurchaseOrderSubmit();

  // Calculate derived values
  const subtotal = calculateTotal();
  const tax = (subtotal * taxRate) / 100;
  const total = subtotal + tax + shippingCost + logisticsCost + transitCost - discount;
  const remainingAmount = total - paidAmount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSupplier) {
      alert("Veuillez sélectionner un fournisseur");
      return;
    }

    if (orderItems.length === 0) {
      alert("Veuillez ajouter au moins un produit");
      return;
    }

    const orderData = {
      supplier_id: selectedSupplier,
      expected_delivery_date: deliveryDate?.toISOString() || null,
      notes,
      items: orderItems,
      total_amount: total,
      payment_status: paymentStatus,
      order_status: orderStatus,
      paid_amount: paidAmount,
      logistics_cost: logisticsCost,
      transit_cost: transitCost,
      tax_rate: taxRate,
      shipping_cost: shippingCost,
      discount: discount
    };

    await submitPurchaseOrder(orderData);
  };

  const isValid = selectedSupplier && orderItems.length > 0;

  console.log("PurchaseOrderForm - Suppliers loaded:", suppliers?.length || 0);
  console.log("PurchaseOrderForm - Suppliers loading:", suppliersLoading);
  console.log("PurchaseOrderForm - Suppliers error:", suppliersError?.message);

  return (
    <div className="space-y-6">
      <CatalogDebugInfo />
      <SuppliersDebugInfo />
      
      <Card className="neo-blur border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Nouveau Bon de Commande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <SupplierDateSection
              supplier={selectedSupplier}
              setSupplier={setSelectedSupplier}
              deliveryDate={deliveryDate}
              setDeliveryDate={setDeliveryDate}
              suppliers={suppliers}
            />

            <StatusSection
              paymentStatus={paymentStatus}
              setPaymentStatus={setPaymentStatus}
              orderStatus={orderStatus}
              setOrderStatus={setOrderStatus}
            />

            <ProductsSection
              orderItems={orderItems}
              removeProductFromOrder={removeProductFromOrder}
              updateProductQuantity={updateProductQuantity}
              updateProductPrice={updateProductPrice}
              calculateTotal={calculateTotal}
              setShowProductModal={setShowProductModal}
            />

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

            <PaymentCounterSection
              paidAmount={paidAmount}
              setPaidAmount={setPaidAmount}
              total={total}
              remainingAmount={remainingAmount}
              formatPrice={formatPrice}
            />

            <NotesSection
              notes={notes}
              setNotes={setNotes}
            />

            <FormActions
              isSubmitting={isSubmitting}
              isValid={isValid}
              onCancel={() => window.history.back()}
            />
          </form>
        </CardContent>
      </Card>

      <ProductSelectionModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        onAddProduct={addProductToOrder}
      />
    </div>
  );
}
