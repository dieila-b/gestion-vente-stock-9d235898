
import { PurchaseOrderTable } from "./PurchaseOrderTable";
import { Loader } from "lucide-react";
import { PurchaseOrder } from "@/types/purchase-order";
import { columns } from "./table/columns";
import { PurchaseOrderActions } from "./table/PurchaseOrderActions";

interface PurchaseOrderListProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  processingOrderId: string | null;
  onApprove: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string) => Promise<void>;
  onPrint: (order: PurchaseOrder) => void;
}

export function PurchaseOrderList({
  orders,
  isLoading,
  processingOrderId,
  onApprove,
  onDelete,
  onEdit,
  onPrint
}: PurchaseOrderListProps) {
  console.log("PurchaseOrderList renders with orders:", orders?.length || 0);
  
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Chargement des bons de commande...</span>
      </div>
    );
  }
  
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-gray-500">Aucun bon de commande trouvé</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Commande</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre articles</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant net</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_number}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(order.created_at).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.supplier?.name || 'Fournisseur inconnu'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items?.length || 0}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'approved' ? 'bg-green-100 text-green-800' :
                  order.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status === 'approved' ? 'Approuvé' :
                   order.status === 'draft' ? 'Brouillon' :
                   'En attente'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(order.total_amount || 0).toLocaleString('fr-FR')} GNF
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <PurchaseOrderActions
                  order={order}
                  processingId={processingOrderId}
                  onApprove={onApprove}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onPrint={onPrint}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
