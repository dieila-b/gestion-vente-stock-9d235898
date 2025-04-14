
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/formatters";
import { PurchaseOrder } from "@/types/purchase-order";

interface GeneralInfoSectionProps {
  purchase: PurchaseOrder;
  formData: any;
  updateFormField: (field: string, value: any) => void;
}

export function GeneralInfoSection({ purchase, formData, updateFormField }: GeneralInfoSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Numéro de commande</Label>
        <Input 
          value={formData.order_number || ''}
          onChange={(e) => updateFormField('order_number', e.target.value)}
        />
      </div>
      
      <div>
        <Label>Fournisseur</Label>
        <Input value={purchase.supplier?.name} readOnly />
      </div>
      
      <div>
        <Label>Date de création</Label>
        <Input value={formatDate(purchase.created_at)} readOnly />
      </div>
      
      <div>
        <Label>Date de livraison prévue</Label>
        <Input 
          type="date"
          value={formData.expected_delivery_date ? formData.expected_delivery_date.split('T')[0] : ''}
          onChange={(e) => updateFormField('expected_delivery_date', e.target.value)}
        />
      </div>
    </div>
  );
}
