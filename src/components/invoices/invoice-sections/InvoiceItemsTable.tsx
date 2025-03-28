
import { formatGNF } from "@/lib/currency";

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
      <div className="grid grid-cols-5 border-b border-black text-center text-sm font-bold bg-gray-100">
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
          <div className="grid grid-cols-5 border-b border-black text-sm" key={index}>
            <div className="p-2 border-r border-black">
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
