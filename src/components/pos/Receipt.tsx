
import { formatGNF } from "@/lib/currency";
import { CartItem } from "@/types/pos";
import { Button } from "../ui/button";
import { Printer, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types/client";
import { useRef } from "react";
import { InvoiceShareActions } from "../invoices/InvoiceShareActions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ImageIcon } from "lucide-react";

interface ReceiptProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  onPrint: () => void;
  selectedClient?: Client | null;
  paymentStatus?: 'paid' | 'partial' | 'pending';
  deliveryStatus?: 'delivered' | 'partial' | 'awaiting' | 'pending';
}

export function Receipt({ 
  items, 
  subtotal, 
  discount, 
  total, 
  onPrint,
  selectedClient,
  paymentStatus = 'pending',
  deliveryStatus = 'awaiting'
}: ReceiptProps) {
  const { toast } = useToast();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const currentDate = format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: fr });
  const invoiceNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
  
  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-md" ref={invoiceRef}>
        {/* Logo and Company Info Header */}
        <div className="grid grid-cols-2 border-b border-gray-200">
          <div className="p-4 border-r border-gray-200">
            <img 
              src="/lovable-uploads/a4c01cc2-c7e7-4877-b12e-00121b9e346b.png" 
              alt="Company Logo"
              className="h-24 object-contain" 
            />
          </div>
          <div className="p-4">
            <h2 className="font-bold text-base mb-2">Information de la société</h2>
            <div className="text-sm space-y-1">
              <p><span className="font-bold">Nom:</span> Ets Aicha Business Alphaya</p>
              <p><span className="font-bold">Adresse:</span> Madina-Gare routière Kankan C/Matam</p>
              <p><span className="font-bold">Téléphone:</span> +224 613 98 11 24 / 625 72 76 93</p>
              <p><span className="font-bold">Email:</span> etsaichabusinessalphaya@gmail.com</p>
            </div>
          </div>
        </div>
        
        {/* Invoice Title */}
        <div className="p-2 border-b border-gray-200 font-bold text-base">
          FACTURE
        </div>
        
        {/* Invoice Details and Client Info */}
        <div className="grid grid-cols-2 border-b border-gray-200">
          <div className="p-4 border-r border-gray-200">
            <p><span className="font-bold">DATE:</span> {currentDate}</p>
            <p><span className="font-bold">FACTURE N°:</span> {invoiceNumber}</p>
          </div>
          <div className="p-4 bg-gray-50">
            <p className="font-bold mb-1">CLIENT:</p>
            <p><span className="font-bold">Adresse:</span> {selectedClient?.address || "Madina C/Matam"}</p>
            <p><span className="font-bold">Email:</span> {selectedClient?.email || "client@example.com"}</p>
          </div>
        </div>
        
        {/* Invoice Items Table */}
        <div className="border-b border-gray-200">
          <div className="grid grid-cols-12 bg-gray-100 text-sm font-medium p-2 border-b border-gray-200">
            <div className="col-span-1"></div>
            <div className="col-span-4">Produit</div>
            <div className="col-span-2 text-right">Prix unitaire</div>
            <div className="col-span-1 text-right">Remise</div>
            <div className="col-span-2 text-right">Prix net</div>
            <div className="col-span-1 text-center">Qté</div>
            <div className="col-span-1 text-right">Total</div>
          </div>
          
          {items.map((item, index) => {
            const itemPrice = item.price;
            const itemDiscount = item.discount || 0;
            const netPrice = itemPrice - itemDiscount;
            const totalPrice = netPrice * item.quantity;
            
            return (
              <div key={index} className="grid grid-cols-12 text-sm p-2 border-b border-gray-100">
                <div className="col-span-1">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-8 h-8 object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 flex items-center justify-center rounded">
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="col-span-4">{item.name}</div>
                <div className="col-span-2 text-right">{formatGNF(itemPrice)}</div>
                <div className="col-span-1 text-right">{itemDiscount > 0 ? formatGNF(itemDiscount) : "-"}</div>
                <div className="col-span-2 text-right">{formatGNF(netPrice)}</div>
                <div className="col-span-1 text-center">{item.quantity}</div>
                <div className="col-span-1 text-right">{formatGNF(totalPrice)}</div>
              </div>
            );
          })}
        </div>
        
        {/* Invoice Summary */}
        <div className="border-b border-gray-200">
          <div className="flex justify-end">
            <table className="w-64 text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-2 font-bold">Montant Total</td>
                  <td className="p-2 text-right">{formatGNF(subtotal)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2 font-bold">Remise</td>
                  <td className="p-2 text-right">{formatGNF(discount)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="p-2">Net À Payer</td>
                  <td className="p-2 text-right">{formatGNF(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Amount in words */}
        <div className="p-3 border-b border-gray-200 text-sm italic">
          Arrêtée la présente facture à la somme de: {formatAmountInWords(total)}
        </div>
        
        {/* Additional client info and totals for mobile view */}
        <div className="p-3 text-sm bg-gray-50">
          <p className="mb-1"><span className="font-bold">Client:</span> {selectedClient?.contact_name || selectedClient?.company_name || "Client comptoir"}</p>
          <div className="flex justify-between mt-2 font-bold">
            <span>Sous-total</span>
            <span>{formatGNF(subtotal)}</span>
          </div>
          <div className="flex justify-between mt-1 font-bold">
            <span>Total</span>
            <span>{formatGNF(total)}</span>
          </div>
        </div>
      </div>
      
      <InvoiceShareActions
        invoiceNumber={invoiceNumber}
        clientName={selectedClient?.company_name || "Client comptoir"}
        clientPhone={selectedClient?.phone}
        clientEmail={selectedClient?.email}
        totalAmount={total}
        invoiceRef={invoiceRef}
        onPrint={onPrint}
        formatGNF={formatGNF}
      />
    </div>
  );
}

// Helper function to convert number to words (simplified version)
function formatAmountInWords(amount: number): string {
  // This is a placeholder. In a production app, you would use a proper
  // number-to-words library or implementation like numberToWords from your lib
  const formattedAmount = formatGNF(amount).replace('GNF', 'Franc Guinéen');
  return `${formattedAmount}`;
}
