
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { usePurchaseEdit } from "@/hooks/purchases/use-purchase-edit";
import { PurchaseHeader } from "@/components/purchases/edit-order/PurchaseHeader";
import { SupplierSection } from "@/components/purchases/edit-order/SupplierSection";
import { OrderDetailsSection } from "@/components/purchases/edit-order/OrderDetailsSection";
import { ProductsList } from "@/components/purchases/edit-order/ProductsList";
import { AdditionalCostsSection } from "@/components/purchases/edit-order/AdditionalCostsSection";
import { OrderSummarySection } from "@/components/purchases/order-form/OrderSummarySection";

const Purchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    suppliers,
    products,
    isLoadingOrder,
    isLoadingProducts,
    selectedSupplier,
    setSelectedSupplier,
    selectedProducts,
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
    expectedDeliveryDate,
    setExpectedDeliveryDate,
    orderStatus,
    setOrderStatus,
    paymentStatus,
    setPaymentStatus,
    handleProductSelect,
    calculateSubtotal,
    calculateTax,
    calculateTotal,
    handleAddProduct,
    handleQuantityChange,
    handlePriceChange,
    handleSubmit
  } = usePurchaseEdit(id);

  if (isLoadingOrder || isLoadingProducts) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PurchaseHeader 
        id={id} 
        navigate={navigate} 
        handleSubmit={handleSubmit} 
      />

      <Card className="p-6 space-y-6 neo-blur border-white/10">
        <SupplierSection
          selectedSupplier={selectedSupplier}
          setSelectedSupplier={setSelectedSupplier}
          suppliers={suppliers || []}
        />

        <OrderDetailsSection
          expectedDeliveryDate={expectedDeliveryDate}
          setExpectedDeliveryDate={setExpectedDeliveryDate}
          orderStatus={orderStatus}
          setOrderStatus={setOrderStatus}
          paymentStatus={paymentStatus}
          setPaymentStatus={setPaymentStatus}
        />

        <ProductsList
          selectedProducts={selectedProducts}
          products={products}
          handleProductSelect={handleProductSelect}
          handleAddProduct={handleAddProduct}
          handleQuantityChange={handleQuantityChange}
          handlePriceChange={handlePriceChange}
        />

        <AdditionalCostsSection
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
