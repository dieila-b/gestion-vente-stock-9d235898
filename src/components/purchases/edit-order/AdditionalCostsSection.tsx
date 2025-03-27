
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AdditionalCostsSectionProps {
  shippingCost: number;
  setShippingCost: (cost: number) => void;
  transitCost: number;
  setTransitCost: (cost: number) => void;
  logisticsCost: number;
  setLogisticsCost: (cost: number) => void;
  discount: number;
  setDiscount: (discount: number) => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;
}

export const AdditionalCostsSection = ({
  shippingCost,
  setShippingCost,
  transitCost,
  setTransitCost,
  logisticsCost,
  setLogisticsCost,
  discount,
  setDiscount,
  taxRate,
  setTaxRate
}: AdditionalCostsSectionProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-white/80">Frais de livraison</Label>
          <Input
            type="number"
            value={shippingCost}
            onChange={(e) => setShippingCost(Number(e.target.value))}
            className="neo-blur"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/80">Transit & Douane</Label>
          <Input
            type="number"
            value={transitCost}
            onChange={(e) => setTransitCost(Number(e.target.value))}
            className="neo-blur"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/80">Frais de logistique</Label>
          <Input
            type="number"
            value={logisticsCost}
            onChange={(e) => setLogisticsCost(Number(e.target.value))}
            className="neo-blur"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white/80">Remise</Label>
          <Input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="neo-blur"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/80">TVA (%)</Label>
          <Input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="neo-blur"
          />
        </div>
      </div>
    </>
  );
};
