
import { DeliveryNote } from "@/types/delivery-note";

interface OrderSummarySectionProps {
  note: DeliveryNote;
}

export function OrderSummarySection({ note }: OrderSummarySectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <strong>Fournisseur:</strong> {note.supplier?.name}
      </div>
      <div>
        <strong>Bon de commande:</strong> {note.purchase_order?.order_number}
      </div>
    </div>
  );
}
