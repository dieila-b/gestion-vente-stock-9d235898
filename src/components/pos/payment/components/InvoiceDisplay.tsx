
import { useRef } from "react";
import { DynamicInvoice } from "@/components/invoices/dynamic/DynamicInvoice";
import { InvoiceShareActions } from "@/components/invoices/InvoiceShareActions";
import { formatGNF } from "@/lib/currency";
import { Receipt } from "./Receipt";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { numberToWords } from "@/lib/numberToWords";

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
  deliveredQuantity?: number;
}

interface CartItemInfo {
  id: string;
  name: string;
  quantity: number;
  deliveredQuantity?: number;
  price?: number;
  discount?: number;
}

interface InvoiceDisplayProps {
  invoiceNumber: string;
  items: CartItemInfo[];
  totalAmount: number;
  amount: number;
  client?: any;
  onClose: () => void;
  paymentStatus?: 'paid' | 'partial' | 'pending';
  deliveryStatus?: 'delivered' | 'partial' | 'awaiting' | 'pending';
  paidAmount?: number;
  remainingAmount?: number;
  isReceipt?: boolean;
}

export function InvoiceDisplay({
  invoiceNumber,
  items,
  totalAmount,
  amount,
  client,
  onClose,
  paymentStatus = 'pending',
  deliveryStatus = 'pending',
  paidAmount = 0,
  remainingAmount = 0,
  isReceipt = false
}: InvoiceDisplayProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const currentDate = format(new Date(), "dd/MM/yyyy", { locale: fr });

  // Convert CartItemInfo to InvoiceItem with price and delivery information
  const invoiceItems: InvoiceItem[] = items.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.price || totalAmount / items.reduce((acc, item) => acc + item.quantity, 1),
    discount: item.discount || 0,
    deliveredQuantity: item.deliveredQuantity || 0
  }));

  // Calculate subtotal and total discount
  const subtotal = invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = invoiceItems.reduce((sum, item) => sum + ((item.discount || 0) * item.quantity), 0);

  if (isReceipt) {
    return (
      <div className="space-y-4">
        <InvoiceShareActions
          invoiceNumber={invoiceNumber}
          clientName={client?.company_name || client?.contact_name || "Client comptoir"}
          clientPhone={client?.phone}
          clientEmail={client?.email}
          totalAmount={totalAmount}
          invoiceRef={invoiceRef}
          formatGNF={formatGNF}
        />
        
        <Receipt 
          invoiceNumber={invoiceNumber}
          items={invoiceItems}
          subtotal={subtotal}
          totalDiscount={totalDiscount}
          total={totalAmount}
          paidAmount={paidAmount}
          remainingAmount={remainingAmount}
          date={currentDate}
          clientName={client?.company_name || client?.contact_name || "Client comptoir"}
          clientPhone={client?.phone}
          clientEmail={client?.email}
          clientAddress={client?.address}
          paymentStatus={paymentStatus}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InvoiceShareActions
        invoiceNumber={invoiceNumber}
        clientName={client?.company_name || client?.contact_name || "Client comptoir"}
        clientPhone={client?.phone}
        clientEmail={client?.email}
        totalAmount={totalAmount}
        invoiceRef={invoiceRef}
        formatGNF={formatGNF}
      />
      
      <div className="bg-white text-black max-w-4xl mx-auto" ref={invoiceRef}>
        {/* Header avec logo et informations société */}
        <div className="flex border-b-2 border-black">
          {/* Logo section */}
          <div className="w-1/3 p-6 flex items-center justify-center border-r-2 border-black">
            <img 
              src="/lovable-uploads/a4c01cc2-c7e7-4877-b12e-00121b9e346b.png" 
              alt="Company Logo"
              className="h-20 w-20 object-contain rounded-full" 
            />
          </div>
          
          {/* Company information */}
          <div className="w-2/3 p-6 bg-gray-50">
            <h2 className="font-bold text-lg mb-4">Information de la société</h2>
            <div className="space-y-1 text-sm">
              <p><span className="font-semibold">Nom:</span> Ets Aicha Business Alphaya</p>
              <p><span className="font-semibold">Adresse:</span> Madina-Gare routière Kankan C/Matam</p>
              <p><span className="font-semibold">Téléphone:</span> +224 613 98 11 24 / 625 72 76 93</p>
              <p><span className="font-semibold">Email:</span> etsaichabusinessalphaya@gmail.com</p>
            </div>
          </div>
        </div>
        
        {/* Titre FACTURE */}
        <div className="border-b-2 border-black p-4">
          <h1 className="text-xl font-bold">FACTURE</h1>
        </div>
        
        {/* Date, numéro facture et client */}
        <div className="flex border-b-2 border-black">
          {/* Date et numéro */}
          <div className="w-1/2 p-4 border-r-2 border-black">
            <div className="space-y-2">
              <p><span className="font-semibold">DATE:</span> {currentDate}</p>
              <p><span className="font-semibold">FACTURE N°:</span> {invoiceNumber}</p>
            </div>
          </div>
          
          {/* Informations client */}
          <div className="w-1/2 p-4 bg-gray-50">
            <h3 className="font-semibold mb-3">CLIENT:</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-semibold">Nom:</span> {client?.company_name || client?.contact_name || "Client comptoir"}</p>
              <p><span className="font-semibold">Téléphone:</span> {client?.phone || ""}</p>
              <p><span className="font-semibold">Adresse:</span> {client?.address || ""}</p>
              <p><span className="font-semibold">Email:</span> {client?.email || ""}</p>
              {client?.client_code && <p><span className="font-semibold">Code:</span> {client.client_code}</p>}
            </div>
          </div>
        </div>
        
        {/* Tableau des produits */}
        <div className="border-b-2 border-black">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-black">
                <th className="border-r border-black p-3 text-left font-semibold">Produit</th>
                <th className="border-r border-black p-3 text-center font-semibold">Prix unitaire</th>
                <th className="border-r border-black p-3 text-center font-semibold">Remise</th>
                <th className="border-r border-black p-3 text-center font-semibold">Prix net</th>
                <th className="border-r border-black p-3 text-center font-semibold">Qté</th>
                <th className="p-3 text-center font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item, index) => {
                const unitPrice = item.price;
                const discount = item.discount || 0;
                const netPrice = unitPrice - discount;
                const totalPrice = netPrice * item.quantity;
                
                return (
                  <tr key={index} className="border-b border-gray-300">
                    <td className="border-r border-gray-300 p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 flex items-center justify-center text-xs">📷</div>
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="border-r border-gray-300 p-3 text-center text-sm">{formatGNF(unitPrice)}</td>
                    <td className="border-r border-gray-300 p-3 text-center text-sm">
                      {discount > 0 ? formatGNF(discount) : "-"}
                    </td>
                    <td className="border-r border-gray-300 p-3 text-center text-sm">{formatGNF(netPrice)}</td>
                    <td className="border-r border-gray-300 p-3 text-center text-sm">{item.quantity}</td>
                    <td className="p-3 text-center text-sm">{formatGNF(totalPrice)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Totaux */}
        <div className="border-b-2 border-black p-4">
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between py-1">
                <span className="font-semibold">Montant Total</span>
                <span>{formatGNF(subtotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold">Remise</span>
                <span>{formatGNF(totalDiscount)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-400 font-bold">
                <span>Net A Payer</span>
                <span>{formatGNF(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Montant en lettres */}
        <div className="border-b-2 border-black p-4">
          <p className="text-sm italic">
            <span className="font-semibold">Arrêtée la présente facture à la somme de:</span> {numberToWords(totalAmount)} Franc Guinéen
          </p>
        </div>
        
        {/* Statuts de paiement et livraison */}
        <div className="flex">
          {/* Statut de paiement */}
          <div className="w-1/2 p-4 border-r-2 border-black">
            <h3 className="font-semibold mb-3">Statut de paiement</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Statut:</span>
                <span className="font-semibold">
                  {paymentStatus === 'paid' ? 'Payé' : 
                   paymentStatus === 'partial' ? 'Partiellement payé' : 
                   'En attente de paiement'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Montant payé:</span>
                <span className="font-semibold">{formatGNF(paidAmount)}</span>
              </div>
              
              {paymentStatus === 'paid' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2 text-green-700">
                    <span>✓</span>
                    <div>
                      <div className="font-semibold">Payé</div>
                      <div className="text-sm">Cette facture a été intégralement payée.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Statut de livraison */}
          <div className="w-1/2 p-4">
            <h3 className="font-semibold mb-3">Statut de livraison</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Statut:</span>
                <span className="font-semibold">
                  {deliveryStatus === 'delivered' ? 'Entièrement livré' : 
                   deliveryStatus === 'partial' ? 'Partiellement livré' : 
                   deliveryStatus === 'awaiting' ? 'En attente de livraison' : 
                   'En attente'}
                </span>
              </div>
              
              {deliveryStatus === 'delivered' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2 text-green-700">
                    <span>✓</span>
                    <div>
                      <div className="font-semibold">Entièrement livré</div>
                      <div className="text-sm">Cette commande a été entièrement livrée.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
