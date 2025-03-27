
import { OrderInfoForm } from "@/components/purchases/order-form/OrderInfoForm";
import { ProductsSection } from "@/components/purchases/order-form/ProductsSection";
import { NotesSection } from "@/components/purchases/order-form/NotesSection";
import { OrderPriceSection } from "@/components/suppliers/order-form/OrderPriceSection";
import { OrderStatusSelect } from "@/components/suppliers/order-form/OrderStatusSelect";
import { PaymentStatusSelect } from "@/components/suppliers/order-form/PaymentStatusSelect";
import { PaymentSection } from "@/components/suppliers/order-form/PaymentSection";
import { PurchaseOrderItem } from "@/types/purchaseOrder";
import { CatalogProduct } from "@/types/catalog";

interface PurchaseFormContentProps {
  orderNumber: string;
  setOrderNumber: (value: string) => void;
  supplier: string;
  setSupplier: (value: string) => void;
  deliveryDate: string;
  setDeliveryDate: (value: string) => void;
  warehouseId: string;
  setWarehouseId: (value: string) => void;
  paymentStatus: "pending" | "partial" | "paid";
  setPaymentStatus: (value: "pending" | "partial" | "paid") => void;
  orderStatus: "pending" | "delivered";
  setOrderStatus: (value: "pending" | "delivered") => void;
  orderItems: PurchaseOrderItem[];
  showProductModal: boolean;
  setShowProductModal: (value: boolean) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filteredProducts: CatalogProduct[];
  addProductToOrder: (product: CatalogProduct) => void;
  removeProductFromOrder: (index: number) => void;
  updateProductQuantity: (index: number, quantity: number) => void;
  updateProductPrice: (index: number, price: number) => void;
  calculateTotal: () => number;
  discount: number;
  shippingCost: number;
  logisticsCost: number;
  transitCost: number;
  taxRate: number;
  onDiscountChange: (value: number) => void;
  onShippingCostChange: (value: number) => void;
  onLogisticsCostChange: (value: number) => void;
  onTransitCostChange: (value: number) => void;
  onTaxRateChange: (value: number) => void;
  subtotal: number;
  tax: number;
  total: number;
  formatPrice: (value: number) => string;
  paidAmount: number;
  totalAmount: number;
  remainingAmount: number;
  onPaidAmountChange: (value: number) => void;
  notes: string;
  setNotes: (value: string) => void;
}

export const PurchaseFormContent = ({
  orderNumber,
  setOrderNumber,
  supplier,
  setSupplier,
  deliveryDate,
  setDeliveryDate,
  warehouseId,
  setWarehouseId,
  paymentStatus,
  setPaymentStatus,
  orderStatus,
  setOrderStatus,
  orderItems,
  showProductModal,
  setShowProductModal,
  searchQuery,
  setSearchQuery,
  filteredProducts,
  addProductToOrder,
  removeProductFromOrder,
  updateProductQuantity,
  updateProductPrice,
  calculateTotal,
  discount,
  shippingCost,
  logisticsCost,
  transitCost,
  taxRate,
  onDiscountChange,
  onShippingCostChange,
  onLogisticsCostChange,
  onTransitCostChange,
  onTaxRateChange,
  subtotal,
  tax,
  total,
  formatPrice,
  paidAmount,
  totalAmount,
  remainingAmount,
  onPaidAmountChange,
  notes,
  setNotes
}: PurchaseFormContentProps) => {
  return (
    <>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PaymentStatusSelect
          value={paymentStatus}
          onChange={setPaymentStatus}
        />
        <OrderStatusSelect
          value={orderStatus}
          onChange={setOrderStatus}
        />
      </div>
      
      <ProductsSection 
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
      />
      
      <OrderPriceSection
        discount={discount}
        shippingCost={shippingCost}
        logisticsCost={logisticsCost}
        transitCost={transitCost}
        taxRate={taxRate}
        onDiscountChange={onDiscountChange}
        onShippingCostChange={onShippingCostChange}
        onLogisticsCostChange={onLogisticsCostChange}
        onTransitCostChange={onTransitCostChange}
        onTaxRateChange={onTaxRateChange}
        subtotal={subtotal}
        tax={tax}
        total={total}
        formatPrice={formatPrice}
      />
      
      <PaymentSection
        paidAmount={paidAmount}
        totalAmount={totalAmount}
        remainingAmount={remainingAmount}
        onPaidAmountChange={onPaidAmountChange}
        formatPrice={formatPrice}
      />
      
      <NotesSection 
        notes={notes}
        setNotes={setNotes}
      />
    </>
  );
};
