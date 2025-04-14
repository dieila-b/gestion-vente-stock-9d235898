
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatGNF } from "@/lib/currency";

interface AdditionalCostsSectionProps {
  formData: any;
  updateFormField: (field: string, value: any) => void;
  totalAmount: number;
}

export function AdditionalCostsSection({ 
  formData, 
  updateFormField,
  totalAmount 
}: AdditionalCostsSectionProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label>Remise</Label>
        <Input 
          type="number"
          value={formData.discount || 0}
          onChange={(e) => updateFormField('discount', Number(e.target.value))}
        />
      </div>
      
      <div>
        <Label>Frais de livraison</Label>
        <Input 
          type="number"
          value={formData.shipping_cost || 0}
          onChange={(e) => updateFormField('shipping_cost', Number(e.target.value))}
        />
      </div>
      
      <div>
        <Label>Frais de transit</Label>
        <Input 
          type="number"
          value={formData.transit_cost || 0}
          onChange={(e) => updateFormField('transit_cost', Number(e.target.value))}
        />
      </div>
      
      <div>
        <Label>Frais logistiques</Label>
        <Input 
          type="number"
          value={formData.logistics_cost || 0}
          onChange={(e) => updateFormField('logistics_cost', Number(e.target.value))}
        />
      </div>
      
      <div>
        <Label>Taux TVA (%)</Label>
        <Input 
          type="number"
          value={formData.tax_rate || 0}
          onChange={(e) => updateFormField('tax_rate', Number(e.target.value))}
        />
      </div>
      
      <div>
        <Label>Montant total</Label>
        <Input value={formatGNF(totalAmount || 0)} readOnly />
      </div>
    </div>
  );
}
