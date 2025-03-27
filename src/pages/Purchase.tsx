
import { Card } from "@/components/ui/card";
import { PurchaseHeader } from "@/components/purchases/form/PurchaseHeader";
import { SupplierSection } from "@/components/purchases/form/SupplierSection";
import { DeliverySection } from "@/components/purchases/form/DeliverySection";
import { ProductsSection } from "@/components/purchases/form/ProductsSection";
import { CostSection } from "@/components/purchases/form/CostSection";
import { OrderSummarySection } from "@/components/purchases/order-form/OrderSummarySection";
import { usePurchaseForm } from "@/hooks/purchases/use-purchase-form";

const Purchase = () => {
  const {
    // Loading states
    isLoading,
    
    // Form data
    id,
    suppliers,
    products,
    selectedSupplier,
    setSelectedSupplier,
    selectedProducts,
    setSelectedProducts,
    expectedDeliveryDate,
    setExpectedDeliveryDate,
    orderStatus,
    setOrderStatus,
    paymentStatus,
    setPaymentStatus,
    
    // Cost fields
    shippingCost,
    setShippingCost,
    transitCost,
    setTransitCost,
    logisticsCost,
    setLogisticsCost,
    discount,
    setDiscount,
    taxRate,
    setTaxRate,
    
    // Actions
    handleProductSelect,
    handleAddProduct,
    handleSubmit,
    
    // Calculations
    calculateSubtotal,
    calculateTax,
    calculateTotal,
    formatGNF
  } = usePurchaseForm();

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = {
      ...selectedProducts[index],
      quantity,
      total_price: quantity * selectedProducts[index].unit_price
    };
    setSelectedProducts(updatedProducts);
  };

  const handlePriceChange = (index: number, price: number) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = {
      ...selectedProducts[index],
      unit_price: price,
      total_price: selectedProducts[index].quantity * price
    };
    setSelectedProducts(updatedProducts);
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PurchaseHeader id={id} onSave={handleSubmit} />

      <Card className="p-6 space-y-6 neo-blur border-white/10">
        <SupplierSection 
          selectedSupplier={selectedSupplier}
          setSelectedSupplier={setSelectedSupplier}
          suppliers={suppliers}
        />

        <DeliverySection
          expectedDeliveryDate={expectedDeliveryDate}
          setExpectedDeliveryDate={setExpectedDeliveryDate}
          orderStatus={orderStatus}
          setOrderStatus={setOrderStatus}
          paymentStatus={paymentStatus}
          setPaymentStatus={setPaymentStatus}
        />

        <ProductsSection
          products={products}
          selectedProducts={selectedProducts}
          onProductSelect={handleProductSelect}
          onAddProduct={handleAddProduct}
          onQuantityChange={handleQuantityChange}
          onPriceChange={handlePriceChange}
          formatGNF={formatGNF}
        />

        <CostSection
          shippingCost={shippingCost}
          setShippingCost={setShippingCost}
          transitCost={transitCost}
          setTransitCost={setTransitCost}
          logisticsCost={logisticsCost}
          setLogisticsCost={setLogisticsCost}
          discount={discount}
          setDiscount={setDiscount}
          taxRate={taxRate}
          setTaxRate={setTaxRate}
        />

        <OrderSummarySection 
          subtotal={calculateSubtotal()}
          tax={calculateTax()}
          total={calculateTotal()}
        />
      </Card>
    </div>
  );
};

export default Purchase;
