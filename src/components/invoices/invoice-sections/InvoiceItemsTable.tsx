
import { formatGNF } from "@/lib/currency";
import { ImageIcon } from "lucide-react";

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
  image_url?: string;
}

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
}

export function InvoiceItemsTable({ items }: InvoiceItemsTableProps) {
  return (
    <>
      <div className="grid grid-cols-6 border-b border-black text-center text-sm">
        <div className="p-2 border-r border-black">Produit</div>
        <div className="p-2 border-r border-black">Prix unitaire</div>
        <div className="p-2 border-r border-black">Remise</div>
        <div className="p-2 border-r border-black">Prix net</div>
        <div className="p-2 border-r border-black">Qté</div>
        <div className="p-2">Total</div>
      </div>
      
      {items.map((item, index) => {
        const itemDiscount = item.discount || 0;
        const netPrice = item.price - itemDiscount;
        const totalPrice = netPrice * item.quantity;
        
        return (
          <div className="grid grid-cols-6 border-b border-black text-sm" key={index}>
            <div className="p-2 border-r border-black flex items-center">
              {item.image_url ? (
                <img src={item.image_url} alt="" className="w-5 h-5 mr-2 object-cover" />
              ) : (
                <div className="w-5 h-5 mr-2 flex-shrink-0 bg-gray-100 flex items-center justify-center rounded">
                  <ImageIcon className="w-3 h-3 text-gray-400" />
                </div>
              )}
              {item.name}
            </div>
            <div className="p-2 border-r border-black text-right">{formatGNF(item.price)}</div>
            <div className="p-2 border-r border-black text-center">{itemDiscount > 0 ? formatGNF(itemDiscount) : '-'}</div>
            <div className="p-2 border-r border-black text-right">{formatGNF(netPrice)}</div>
            <div className="p-2 border-r border-black text-center">{item.quantity}</div>
            <div className="p-2 text-right">{formatGNF(totalPrice)}</div>
          </div>
        );
      })}
    </>
  );
}
