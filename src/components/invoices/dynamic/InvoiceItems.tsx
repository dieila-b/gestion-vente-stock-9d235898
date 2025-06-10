
import { formatGNF } from "@/lib/currency";

interface Item {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
  image?: string | null;
  deliveredQuantity?: number;
}

interface InvoiceItemsProps {
  items: Item[];
  showDeliveryInfo?: boolean;
}

export function InvoiceItems({ items, showDeliveryInfo = false }: InvoiceItemsProps) {
  return (
    <div className="border-b border-black">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 border-b border-black">
            <th className="border-r border-black p-3 text-left text-sm font-bold">Produit</th>
            <th className="border-r border-black p-3 text-center text-sm font-bold">Prix unitaire</th>
            <th className="border-r border-black p-3 text-center text-sm font-bold">Remise</th>
            <th className="border-r border-black p-3 text-center text-sm font-bold">Prix net</th>
            <th className="border-r border-black p-3 text-center text-sm font-bold">Qté</th>
            {showDeliveryInfo && (
              <>
                <th className="border-r border-black p-3 text-center text-sm font-bold">Livré</th>
                <th className="border-r border-black p-3 text-center text-sm font-bold">Restant</th>
              </>
            )}
            <th className="p-3 text-center text-sm font-bold">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const unitPrice = item.price;
            const discount = item.discount || 0;
            const netPrice = unitPrice - discount;
            const total = netPrice * item.quantity;
            const deliveredQty = item.deliveredQuantity || 0;
            const remainingQty = item.quantity - deliveredQty;

            return (
              <tr key={index} className="border-b border-gray-200">
                <td className="border-r border-gray-200 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                    <span>{item.name}</span>
                  </div>
                </td>
                <td className="border-r border-gray-200 p-3 text-center text-sm">{formatGNF(unitPrice)}</td>
                <td className="border-r border-gray-200 p-3 text-center text-sm">
                  {discount > 0 ? formatGNF(discount) : "-"}
                </td>
                <td className="border-r border-gray-200 p-3 text-center text-sm">{formatGNF(netPrice)}</td>
                <td className="border-r border-gray-200 p-3 text-center text-sm">{item.quantity}</td>
                {showDeliveryInfo && (
                  <>
                    <td className="border-r border-gray-200 p-3 text-center text-sm font-bold text-green-600">
                      {deliveredQty}
                    </td>
                    <td className="border-r border-gray-200 p-3 text-center text-sm font-bold text-orange-600">
                      {remainingQty}
                    </td>
                  </>
                )}
                <td className="p-3 text-center text-sm">{formatGNF(total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
