
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerCustom } from "@/components/ui/date-picker-custom";

interface OrderDetailsSectionProps {
  expectedDeliveryDate: string;
  setExpectedDeliveryDate: (date: string) => void;
  orderStatus: 'draft' | 'pending' | 'delivered' | 'approved';
  setOrderStatus: (status: 'draft' | 'pending' | 'delivered' | 'approved') => void;
  paymentStatus: 'pending' | 'partial' | 'paid';
  setPaymentStatus: (status: 'pending' | 'partial' | 'paid') => void;
}

export const OrderDetailsSection = ({
  expectedDeliveryDate,
  setExpectedDeliveryDate,
  orderStatus,
  setOrderStatus,
  paymentStatus,
  setPaymentStatus
}: OrderDetailsSectionProps) => {
  const deliveryDate = expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined;
  
  const handleDateChange = (date: Date | undefined) => {
    setExpectedDeliveryDate(date ? date.toISOString() : '');
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label className="text-white/80">Date de livraison prévue</Label>
        <DatePickerCustom
          date={deliveryDate}
          onDateChange={handleDateChange}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white/80">Statut de la commande</Label>
        <Select 
          value={orderStatus} 
          onValueChange={(value: 'draft' | 'pending' | 'delivered' | 'approved') => setOrderStatus(value)}
        >
          <SelectTrigger className="neo-blur">
            <SelectValue placeholder="Sélectionner un statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="delivered">Livrée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white/80">Statut du paiement</Label>
        <Select 
          value={paymentStatus} 
          onValueChange={(value: 'pending' | 'partial' | 'paid') => setPaymentStatus(value)}
        >
          <SelectTrigger className="neo-blur">
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
};
