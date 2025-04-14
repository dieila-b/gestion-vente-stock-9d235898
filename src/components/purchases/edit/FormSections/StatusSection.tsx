
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StatusSectionProps {
  deliveryStatus: string;
  paymentStatus: string;
  updateStatus: (status: string) => void;
  updatePaymentStatus: (status: string) => void;
}

export function StatusSection({ 
  deliveryStatus, 
  paymentStatus, 
  updateStatus, 
  updatePaymentStatus 
}: StatusSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Statut</Label>
        <Select 
          value={deliveryStatus}
          onValueChange={(value) => updateStatus(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner un statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="delivered">Livré</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Statut de paiement</Label>
        <Select 
          value={paymentStatus}
          onValueChange={(value) => updatePaymentStatus(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner un statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="partial">Partiel</SelectItem>
            <SelectItem value="paid">Payé</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
