
interface OrderStatusProps {
  status: string;
}

export function OrderStatus({ status }: OrderStatusProps) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      status === 'approved' ? 'bg-green-100 text-green-800' :
      status === 'draft' ? 'bg-gray-100 text-gray-800' :
      'bg-yellow-100 text-yellow-800'
    }`}>
      {status === 'approved' ? 'Approuvé' :
       status === 'draft' ? 'Brouillon' :
       'En attente'}
    </span>
  );
}
