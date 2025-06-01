
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface PurchaseOrderFormProps {
  onClose: () => void;
}

export function PurchaseOrderForm({ onClose }: PurchaseOrderFormProps) {
  const [formData, setFormData] = useState({
    order_number: '',
    supplier_id: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form data:', formData);
    onClose();
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Nouveau Bon de Commande</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="order_number">Numéro de commande</Label>
          <Input
            id="order_number"
            value={formData.order_number}
            onChange={(e) => setFormData(prev => ({ ...prev, order_number: e.target.value }))}
            placeholder="BC-001"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notes sur la commande..."
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit">Créer la commande</Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  );
}
