
import React from 'react';
import { formatGNF } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Define the EnhancedCartItem type used in this component
interface EnhancedCartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  discount: number;
  category: string;
  product_id: string;
  subtotal: number; // This was missing and causing the error
}

interface PurchaseOrderReceiptProps {
  orderData: {
    order_number: string;
    supplier: {
      name: string;
    };
    status: string;
    created_at: string;
    items: EnhancedCartItem[];
    totals: {
      subtotal: number;
      tax: number;
      logistics: number;
      shipping: number;
      total: number;
    };
  };
}

const PurchaseOrderReceipt: React.FC<PurchaseOrderReceiptProps> = ({ orderData }) => {
  // Convert the items to the EnhancedCartItem type with all required fields
  const enhancedItems: EnhancedCartItem[] = orderData.items.map(item => ({
    id: item.id || '',
    name: item.name || 'Unnamed Product',
    quantity: item.quantity || 0,
    price: item.price || 0,
    total: item.total || 0,
    discount: item.discount || 0,
    category: item.category || 'Uncategorized',
    product_id: item.product_id || item.id || '', // Ensure product_id is set
    subtotal: (item.price || 0) * (item.quantity || 0) // Calculate subtotal if not provided
  }));

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">Bon de commande #{orderData.order_number}</CardTitle>
            <p className="text-muted-foreground">Fournisseur: {orderData.supplier.name}</p>
            <p className="text-muted-foreground mt-1">Date: {new Date(orderData.created_at).toLocaleDateString()}</p>
          </div>
          <Badge 
            variant={orderData.status === 'completed' ? 'default' : 
                    orderData.status === 'pending' ? 'outline' : 'secondary'}
          >
            {orderData.status === 'completed' ? 'Complété' : 
             orderData.status === 'pending' ? 'En attente' : 'Brouillon'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-2 text-left font-medium text-muted-foreground">Produit</th>
                <th className="p-2 text-right font-medium text-muted-foreground">Prix unitaire</th>
                <th className="p-2 text-right font-medium text-muted-foreground">Quantité</th>
                <th className="p-2 text-right font-medium text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {enhancedItems.map((item, index) => (
                <tr key={item.id || index} className="border-t">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2 text-right">{formatGNF(item.price)}</td>
                  <td className="p-2 text-right">{item.quantity}</td>
                  <td className="p-2 text-right">{formatGNF(item.total || (item.price * item.quantity))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-end">
          <div className="w-1/3">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Sous-total:</span>
              <span>{formatGNF(orderData.totals.subtotal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Taxes:</span>
              <span>{formatGNF(orderData.totals.tax)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Logistique:</span>
              <span>{formatGNF(orderData.totals.logistics)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Livraison:</span>
              <span>{formatGNF(orderData.totals.shipping)}</span>
            </div>
            <div className="flex justify-between py-1 border-t mt-1 font-bold">
              <span>Total:</span>
              <span>{formatGNF(orderData.totals.total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseOrderReceipt;
