
import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  let color = "";
  let text = "";

  switch (status) {
    case 'pending':
      color = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      text = "En attente";
      break;
    case 'partial':
      color = "bg-blue-500/10 text-blue-500 border-blue-500/20";
      text = "Paiement partiel";
      break;
    case 'paid':
      color = "bg-green-500/10 text-green-500 border-green-500/20";
      text = "Payé";
      break;
    case 'delivered':
      color = "bg-green-700/10 text-green-700 border-green-700/20";
      text = "Livré";
      break;
    case 'canceled':
      color = "bg-red-500/10 text-red-500 border-red-500/20";
      text = "Annulé";
      break;
    default:
      color = "bg-gray-500/10 text-gray-500 border-gray-500/20";
      text = status;
  }
  
  return <Badge className={`${color} capitalize`}>{text}</Badge>;
}
