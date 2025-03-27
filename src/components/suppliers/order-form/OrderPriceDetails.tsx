
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";

interface OrderPriceDetailsProps {
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

export const OrderPriceDetails = ({
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
}: OrderPriceDetailsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Remise</Label>
          <FormattedNumberInput
            value={discount}
            onChange={onDiscountChange}
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label>Frais de livraison</Label>
          <FormattedNumberInput
            value={shippingCost}
            onChange={onShippingCostChange}
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label>Frais de logistique</Label>
          <FormattedNumberInput
            value={logisticsCost}
            onChange={onLogisticsCostChange}
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label>Transit & Douane</Label>
          <FormattedNumberInput
            value={transitCost}
            onChange={onTransitCostChange}
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label>Taux de TVA (%)</Label>
          <Input
            type="number"
            value={taxRate}
            onChange={(e) => onTaxRateChange(Number(e.target.value))}
            min={0}
            max={100}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sous-total</Label>
          <Input
            value={formatPrice(subtotal)}
            readOnly
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <Label>TVA</Label>
          <Input
            value={formatPrice(tax)}
            readOnly
            className="bg-gray-50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Total TTC</Label>
        <Input
          value={formatPrice(total)}
          readOnly
          className="bg-gray-50 text-lg font-bold"
        />
      </div>
    </>
  );
};
