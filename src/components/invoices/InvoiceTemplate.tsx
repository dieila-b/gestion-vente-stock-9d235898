
import { formatGNF } from "@/lib/currency";
import { numberToWords } from "@/lib/numberToWords";
import { ImageIcon } from "lucide-react";
import { useRef } from "react";
import { InvoiceShareActions } from "./InvoiceShareActions";

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
  image_url?: string;
}

interface InvoiceTemplateProps {
  invoiceNumber: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  clientCode?: string;
  paymentStatus?: 'paid' | 'partial' | 'pending';
  paidAmount?: number;
  remainingAmount?: number;
  deliveryStatus?: 'delivered' | 'partial' | 'pending' | 'awaiting';
  onShare?: boolean;
}

export function InvoiceTemplate({
  invoiceNumber,
  date,
  items,
  subtotal,
  discount,
  total,
  clientName = "Client comptoir",
  clientPhone,
  clientEmail,
  clientAddress = "Madina C/Matam",
  clientCode,
  paymentStatus = 'pending',
  paidAmount = 0,
  remainingAmount = 0,
  deliveryStatus = 'pending',
  onShare = true
}: InvoiceTemplateProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  // Format status labels
  const getPaymentStatusLabel = () => {
    switch (paymentStatus) {
      case 'paid': return 'Payé';
      case 'partial': return 'Partiellement payé';
      default: return 'En attente';
    }
  };
  
  const getDeliveryStatusLabel = () => {
    switch (deliveryStatus) {
      case 'delivered': return 'Entièrement livré';
      case 'partial': return 'Partiellement livré';
      case 'awaiting': return 'En attente de livraison';
      default: return 'En attente';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {onShare && (
        <div className="mb-4">
          <InvoiceShareActions
            invoiceNumber={invoiceNumber}
            clientName={clientName}
            clientPhone={clientPhone}
            clientEmail={clientEmail}
            totalAmount={total}
            invoiceRef={invoiceRef}
            formatGNF={formatGNF}
          />
        </div>
      )}
      
      <div 
        ref={invoiceRef} 
        className="bg-white text-black border border-black"
        style={{ width: '100%', pageBreakInside: 'avoid' }}
      >
        {/* Header section with company logo and info */}
        <div className="flex border-b border-black">
          <div className="w-1/3 p-4 border-r border-black">
            <img 
              src="/lovable-uploads/959478b8-493c-44d8-ae11-c874557f5d54.png" 
              alt="Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <div className="w-2/3 p-4">
            <h2 className="font-bold mb-1">Information de la société</h2>
            <p><strong>Nom:</strong> Ets Aicha Business Alphaya</p>
            <p><strong>Adresse:</strong> Madina-Gare routière Kankan C/Matam</p>
            <p><strong>Téléphone:</strong> +224 613 98 11 24 / 625 72 76 93</p>
            <p><strong>Email:</strong> etsaichabusinessalphaya@gmail.com</p>
          </div>
        </div>
        
        {/* FACTURE title - separate section */}
        <div className="bg-white p-4 border-b border-black font-bold text-xl">
          FACTURE
        </div>
        
        {/* Invoice details and client info */}
        <div className="flex border-b border-black">
          <div className="w-1/2 p-4 border-r border-black">
            <p><strong>DATE:</strong> {date}</p>
            <p><strong>FACTURE N°:</strong> {invoiceNumber}</p>
          </div>
          <div className="w-1/2 p-4">
            <p><strong>CLIENT:</strong></p>
            <p><strong>Nom:</strong> {clientName}</p>
            {clientPhone && <p><strong>Téléphone:</strong> {clientPhone}</p>}
            <p><strong>Adresse:</strong> {clientAddress}</p>
            {clientEmail && <p><strong>Email:</strong> {clientEmail}</p>}
            {clientCode && <p><strong>Code:</strong> {clientCode}</p>}
          </div>
        </div>
        
        {/* Products table header */}
        <div className="grid grid-cols-6 border-b border-black text-center text-sm">
          <div className="p-2 border-r border-black">Produit</div>
          <div className="p-2 border-r border-black">Prix unitaire</div>
          <div className="p-2 border-r border-black">Remise</div>
          <div className="p-2 border-r border-black">Prix net</div>
          <div className="p-2 border-r border-black">Qté</div>
          <div className="p-2">Total</div>
        </div>
        
        {/* Products rows */}
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
        
        {/* Totals */}
        <div className="border-b border-black">
          <div className="ml-auto w-1/2">
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-2 border-r border-black font-medium">Montant Total</div>
              <div className="p-2 text-right">{formatGNF(subtotal)}</div>
            </div>
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-2 border-r border-black font-medium">Remise</div>
              <div className="p-2 text-right">{formatGNF(discount)}</div>
            </div>
            <div className="grid grid-cols-2 font-bold">
              <div className="p-2 border-r border-black">Net à Payer</div>
              <div className="p-2 text-right">{formatGNF(total)}</div>
            </div>
          </div>
        </div>
        
        {/* Amount in words */}
        <div className="p-2 border-b border-black text-sm">
          <p>Arrêtée la présente facture à la somme de: {numberToWords(total)} Franc Guinéen</p>
        </div>
        
        {/* Payment and delivery status */}
        <div className="border-b border-black">
          <div className="grid grid-cols-2">
            <div className="border-r border-black">
              <div className="p-2 font-bold border-b border-black">Statut de paiement</div>
              <div className="grid grid-cols-2 border-b border-black">
                <div className="p-2 border-r border-black">Statut:</div>
                <div className="p-2 font-semibold">{getPaymentStatusLabel()}</div>
              </div>
              <div className="grid grid-cols-2 border-b border-black">
                <div className="p-2 border-r border-black">Montant payé:</div>
                <div className="p-2 text-right">{formatGNF(paidAmount)}</div>
              </div>
              
              {paymentStatus === 'paid' && (
                <div className="p-2 text-green-600 flex items-center border-t border-black">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  Cette facture a été intégralement payée.
                </div>
              )}
            </div>
            
            <div>
              <div className="p-2 font-bold border-b border-black">Statut de livraison</div>
              <div className="grid grid-cols-2 border-b border-black">
                <div className="p-2 border-r border-black">Statut:</div>
                <div className="p-2 font-semibold">{getDeliveryStatusLabel()}</div>
              </div>
              
              {deliveryStatus === 'delivered' && (
                <div className="p-2 text-green-600 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  Cette commande a été entièrement livrée.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
