
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";

interface AdditionalCostsSectionProps {
  discount: number;
  setDiscount: (value: number) => void;
  shippingCost: number;
  setShippingCost: (value: number) => void;
  logisticsCost: number;
  setLogisticsCost: (value: number) => void;
  transitCost: number;
  setTransitCost: (value: number) => void;
  taxRate: number;
  setTaxRate: (value: number) => void;
  subtotal: number;
  tax: number;
  total: number;
  formatPrice: (value: number) => string;
}

export const AdditionalCostsSection = ({
  discount,
  setDiscount,
  shippingCost,
  setShippingCost,
  logisticsCost,
  setLogisticsCost,
  transitCost,
  setTransitCost,
  taxRate,
  setTaxRate,
  subtotal,
  tax,
  total,
  formatPrice,
}: AdditionalCostsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white/80">Coûts additionnels</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-white/80">Remise</Label>
          <FormattedNumberInput
            value={discount}
            onChange={setDiscount}
            min={0}
            className="neo-blur border-white/10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/80">Frais de livraison</Label>
          <FormattedNumberInput
            value={shippingCost}
            onChange={setShippingCost}
            min={0}
            className="neo-blur border-white/10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/80">Frais de logistique</Label>
          <FormattedNumberInput
            value={logisticsCost}
            onChange={setLogisticsCost}
            min={0}
            className="neo-blur border-white/10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/80">Transit & Douane</Label>
          <FormattedNumberInput
            value={transitCost}
            onChange={setTransitCost}
            min={0}
            className="neo-blur border-white/10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/80">Taux de TVA (%)</Label>
          <Input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            min={0}
            max={100}
            className="neo-blur border-white/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white/80">Sous-total</Label>
          <Input
            value={formatPrice(subtotal)}
            readOnly
            className="bg-white/5 border-white/10 text-white/80"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/80">TVA</Label>
          <Input
            value={formatPrice(tax)}
            readOnly
            className="bg-white/5 border-white/10 text-white/80"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white/80">Total TTC</Label>
        <Input
          value={formatPrice(total)}
          readOnly
          className="bg-white/5 border-white/10 text-white/80 text-lg font-bold"
        />
      </div>
    </div>
  );
};
