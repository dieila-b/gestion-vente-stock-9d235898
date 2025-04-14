
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatGNF } from "@/lib/currency";

interface ProductItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  selling_price: number;
  total_price: number;
  purchase_order_id?: string;
  product?: {
    id?: string;
    name: string;
    reference?: string;
  };
}

interface ProductsSectionProps {
  items: ProductItem[];
  updateItemQuantity: (itemId: string, quantity: number) => void;
}

export function ProductsSection({ items, updateItemQuantity }: ProductsSectionProps) {
  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Produit</th>
            <th className="p-2 text-right">Quantité</th>
            <th className="p-2 text-right">Prix unitaire</th>
            <th className="p-2 text-right">Prix vente</th>
            <th className="p-2 text-right">Prix total</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-2">{item.product?.name || `Produit #${item.product_id}`}</td>
              <td className="p-2 text-right">
                <Input
                  type="number"
                  value={item.quantity}
                  className="w-20 text-right"
                  min={1}
                  onChange={(e) => updateItemQuantity(item.id, Number(e.target.value))}
                />
              </td>
              <td className="p-2 text-right">
                <Input
                  type="number"
                  value={item.unit_price}
                  className="w-28 text-right"
                  min={0}
                  disabled
                />
              </td>
              <td className="p-2 text-right">
                <Input
                  type="number"
                  value={item.selling_price || 0}
                  className="w-28 text-right"
                  min={0}
                  disabled
                />
              </td>
              <td className="p-2 text-right">{formatGNF(item.total_price || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
