
import { OrderPriceDetails } from "./OrderPriceDetails";

interface OrderPriceSectionProps {
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
  formatPrice: (price: number) => string;
}

export const OrderPriceSection = ({
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
}: OrderPriceSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Coûts additionnels</h3>
      <OrderPriceDetails
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
    </div>
  );
};
