
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatGNF } from "@/lib/currency";
import { ImageIcon } from "lucide-react";

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
  image?: string;
  deliveredQuantity?: number;
}

interface InvoiceItemsProps {
  items: InvoiceItem[];
  showDeliveryInfo?: boolean;
}

export function InvoiceItems({ items, showDeliveryInfo = false }: InvoiceItemsProps) {
  return (
    <div className="border-b border-black">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="w-12"></TableHead>
            <TableHead>Produit</TableHead>
            <TableHead className="text-right">Prix unitaire</TableHead>
            <TableHead className="text-right">Remise</TableHead>
            <TableHead className="text-right">Prix net</TableHead>
            <TableHead className="text-center">Qté</TableHead>
            {showDeliveryInfo && (
              <>
                <TableHead className="text-center">Livré</TableHead>
                <TableHead className="text-center">Restant</TableHead>
              </>
            )}
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            // Get the original price
            const originalPrice = item.price;
            
            // Calculate discount per unit
            const unitDiscount = item.discount || 0;
            
            // Calculate unit price after discount
            const unitPriceAfterDiscount = Math.max(0, originalPrice - unitDiscount);
            
            // Calculate total as original price * quantity (before discount)
            const totalBeforeDiscount = originalPrice * item.quantity;
            
            // Calculate total discount for this item
            const totalDiscount = unitDiscount * item.quantity;
            
            // Calculate remaining quantity if delivery info is shown
            const deliveredQty = item.deliveredQuantity || 0;
            const remainingQty = item.quantity - deliveredQty;
            
            return (
              <TableRow key={item.id} className="border-t border-gray-200">
                <TableCell>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-right">{formatGNF(originalPrice)}</TableCell>
                <TableCell className="text-right">
                  {unitDiscount > 0 ? formatGNF(unitDiscount) : "-"}
                </TableCell>
                <TableCell className="text-right">{formatGNF(unitPriceAfterDiscount)}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                {showDeliveryInfo && (
                  <>
                    <TableCell className="text-center">
                      <span className={deliveredQty > 0 ? "text-green-600 font-medium" : "text-gray-500"}>
                        {deliveredQty}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={remainingQty > 0 ? "text-amber-600 font-medium" : "text-gray-500"}>
                        {remainingQty}
                      </span>
                    </TableCell>
                  </>
                )}
                <TableCell className="text-right">
                  {formatGNF(totalBeforeDiscount)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
