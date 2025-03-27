
import { Clock, AlertCircle, DollarSign, Truck, ShoppingCart, Package, CheckCircle } from "lucide-react";
import { ReactNode } from "react";

export function useOrderStatus() {
  const getStatusIcon = (status: string): ReactNode => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'partial':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      case 'paid':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'delivered':
        return <Truck className="h-4 w-4 text-green-700" />;
      case 'canceled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <ShoppingCart className="h-4 w-4" />;
    }
  };

  const getItemStatusIcon = (status: string): ReactNode => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Package className="h-4 w-4 text-yellow-500" />;
      case 'out_of_stock':
        return <Package className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getItemStatusText = (status: string): ReactNode => {
    switch (status) {
      case 'available':
        return <span className="text-green-500 font-medium">Disponible</span>;
      case 'pending':
        return <span className="text-yellow-500">Stock insuffisant</span>;
      case 'out_of_stock':
        return <span className="text-red-500">Rupture de stock</span>;
      default:
        return <span className="text-yellow-500">En attente</span>;
    }
  };

  // Fonction pour vérifier si tous les produits d'une précommande sont disponibles
  const areAllItemsAvailable = (order: any) => {
    return order.items.every((item: any) => item.status === 'available');
  };

  return {
    getStatusIcon,
    getItemStatusIcon,
    getItemStatusText,
    areAllItemsAvailable
  };
}
