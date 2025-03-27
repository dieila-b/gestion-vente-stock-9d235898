
import { formatGNF } from "@/lib/currency";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRef } from "react";
import { InvoiceShareActions } from "@/components/invoices/InvoiceShareActions";
import { ImageIcon } from "lucide-react";

interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
  image_url?: string;
}

interface ReceiptProps {
  invoiceNumber: string;
  items: ReceiptItem[];
  subtotal: number;
  totalDiscount: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  date: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  paymentStatus: 'paid' | 'partial' | 'pending';
}

export function Receipt({
  invoiceNumber,
  items,
  subtotal,
  totalDiscount,
  total,
  paidAmount,
  remainingAmount,
  date,
  clientName,
  clientPhone,
  clientEmail,
  clientAddress,
  paymentStatus
}: ReceiptProps) {
  const formattedDate = date || format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: fr });
  const receiptRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="w-full mx-auto">
      {/* Action buttons at the top */}
      <div className="mb-4">
        <InvoiceShareActions
          invoiceNumber={invoiceNumber}
          clientName={clientName || "Client comptoir"}
          clientPhone={clientPhone}
          clientEmail={clientEmail}
          totalAmount={total}
          invoiceRef={receiptRef}
          formatGNF={formatGNF}
        />
      </div>
      
      <div className="bg-white border border-gray-200 rounded-md" ref={receiptRef}>
        {/* Logo and Company Info Header */}
        <div className="grid grid-cols-2 border-b border-gray-200">
          <div className="p-3 border-r border-gray-200">
            <img 
              src="/lovable-uploads/a4c01cc2-c7e7-4877-b12e-00121b9e346b.png" 
              alt="Company Logo"
              className="h-20 object-contain" 
            />
          </div>
          <div className="p-3">
            <h2 className="font-bold text-sm mb-1">Information de la société</h2>
            <div className="text-xs space-y-0.5">
              <p><span className="font-bold">Nom:</span> Ets Aicha Business Alphaya</p>
              <p><span className="font-bold">Adresse:</span> Madina-Gare routière Kankan C/Matam</p>
              <p><span className="font-bold">Téléphone:</span> +224 613 98 11 24 / 625 72 76 93</p>
              <p><span className="font-bold">Email:</span> etsaichabusinessalphaya@gmail.com</p>
            </div>
          </div>
        </div>
        
        {/* Invoice Title */}
        <div className="p-1.5 border-b border-gray-200 font-bold text-base">
          FACTURE
        </div>
        
        {/* Invoice Details and Client Info */}
        <div className="grid grid-cols-2 border-b border-gray-200">
          <div className="p-3 border-r border-gray-200">
            <p className="text-xs"><span className="font-bold">DATE:</span> {formattedDate}</p>
            <p className="text-xs"><span className="font-bold">FACTURE N°:</span> {invoiceNumber}</p>
          </div>
          <div className="p-3 bg-gray-50">
            <p className="font-bold text-xs mb-1">CLIENT:</p>
            <p className="text-xs"><span className="font-bold">Adresse:</span> {clientAddress || "Madina C/Matam"}</p>
            <p className="text-xs"><span className="font-bold">Email:</span> {clientEmail || (clientName ? `${clientName.toLowerCase().replace(/\s+/g, '')}@gmail.com` : "client@example.com")}</p>
          </div>
        </div>
        
        {/* Invoice Items Table */}
        <div className="border-b border-gray-200">
          <div className="grid grid-cols-12 bg-gray-100 text-xs font-medium p-1.5 border-b border-gray-200">
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
              <div key={index} className="grid grid-cols-12 text-xs p-1.5 border-b border-gray-100">
                <div className="col-span-1">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-6 h-6 object-cover rounded" />
                  ) : (
                    <div className="w-6 h-6 bg-gray-100 flex items-center justify-center rounded">
                      <ImageIcon className="w-3 h-3 text-gray-400" />
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
        
        {/* Invoice Summary - WIDENED */}
        <div className="border-b border-gray-200">
          <div className="flex justify-end">
            <table className="w-96 text-xs">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-1.5 font-bold">Montant Total</td>
                  <td className="p-1.5 text-right">{formatGNF(subtotal)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-1.5 font-bold">Remise</td>
                  <td className="p-1.5 text-right">{formatGNF(totalDiscount)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="p-1.5">Net À Payer</td>
                  <td className="p-1.5 text-right">{formatGNF(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Amount in words - REDUCED */}
        <div className="p-2 border-b border-gray-200 text-xs italic">
          Arrêtée la présente facture à la somme de: {formatAmountInWords(total)}
        </div>
        
        {/* Additional client info and totals for mobile view - SMALLER TEXT */}
        <div className="p-2 text-xs bg-gray-50">
          <p className="mb-0.5"><span className="font-bold">Client:</span> {clientName || "Client comptoir"}</p>
          
          {/* Smaller payment and delivery status */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="text-xxs">
              <p className="font-bold">Statut de paiement:</p>
              <p>{paymentStatus === 'paid' ? 'Payé' : paymentStatus === 'partial' ? 'Partiellement payé' : 'En attente'}</p>
              {paymentStatus !== 'pending' && (
                <>
                  <p>Montant payé: {formatGNF(paidAmount)}</p>
                  {remainingAmount > 0 && <p>Reste à payer: {formatGNF(remainingAmount)}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert number to words (simplified version)
function formatAmountInWords(amount: number): string {
  // This is a placeholder. In a production app, you would use a proper
  // number-to-words library or implementation
  return `${formatGNF(amount).replace('GNF', 'Franc Guinéen')}`;
}
