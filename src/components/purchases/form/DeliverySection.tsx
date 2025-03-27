
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays } from "lucide-react";

interface DeliverySectionProps {
  expectedDeliveryDate: string;
  setExpectedDeliveryDate: (value: string) => void;
  orderStatus: 'draft' | 'pending' | 'delivered' | 'approved';
  setOrderStatus: (value: 'draft' | 'pending' | 'delivered' | 'approved') => void;
  paymentStatus: 'pending' | 'partial' | 'paid';
  setPaymentStatus: (value: 'pending' | 'partial' | 'paid') => void;
}

export function DeliverySection({
  expectedDeliveryDate,
  setExpectedDeliveryDate,
  orderStatus,
  setOrderStatus,
  paymentStatus,
  setPaymentStatus
}: DeliverySectionProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label className="text-white/80">Date de livraison prévue</Label>
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
          <Input
            type="date"
            className="pl-10 neo-blur"
            value={expectedDeliveryDate}
            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
          />
        </div>
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
}
