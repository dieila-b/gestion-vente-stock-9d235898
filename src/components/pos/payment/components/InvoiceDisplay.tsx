
import { useRef } from "react";
import { DynamicInvoice } from "@/components/invoices/dynamic/DynamicInvoice";
import { InvoiceShareActions } from "@/components/invoices/InvoiceShareActions";
import { formatGNF } from "@/lib/currency";
import { Receipt } from "./Receipt";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

  // Helper function to convert number to words (simplified version)
  const formatAmountInWords = (amount: number): string => {
    return `${formatGNF(amount).replace(' GNF', '')} Franc Guinéen`;
  };

  // Helper functions to get readable status labels
  const getPaymentStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'paid': 'Entièrement payé',
      'partial': 'Partiellement payé', 
      'pending': 'En attente de paiement'
    };
    return statusMap[status] || status;
  };

  const getDeliveryStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'delivered': 'Entièrement livré',
      'partial': 'Partiellement livré',
      'awaiting': 'En attente de livraison',
      'pending': 'En attente'
    };
    return statusMap[status] || status;
  };

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
      
      <div className="bg-white rounded-sm border border-gray-400" ref={invoiceRef}>
        {/* Header with logo and company info */}
        <div className="grid grid-cols-2 border-b border-gray-400">
          <div className="p-4 border-r border-gray-400 flex items-center justify-center">
            <img 
              src="/lovable-uploads/a4c01cc2-c7e7-4877-b12e-00121b9e346b.png" 
              alt="Company Logo"
              className="h-20 object-contain" 
            />
          </div>
          <div className="p-4 bg-gray-50">
            <h2 className="font-bold text-base mb-3">Information de la société</h2>
            <div className="text-sm space-y-1">
              <p><span className="font-bold">Nom:</span> Ets Aicha Business Alphaya</p>
              <p><span className="font-bold">Adresse:</span> Madina-Gare routière Kankan C/Matam</p>
              <p><span className="font-bold">Téléphone:</span> +224 613 98 11 24 / 625 72 76 93</p>
              <p><span className="font-bold">Email:</span> etsaichabusinessalphaya@gmail.com</p>
            </div>
          </div>
        </div>
        
        {/* Invoice title */}
        <div className="border-b border-gray-400 p-3">
          <h1 className="text-lg font-bold">FACTURE</h1>
        </div>
        
        {/* Invoice details and client info */}
        <div className="grid grid-cols-2 border-b border-gray-400">
          <div className="p-4 border-r border-gray-400">
            <div className="space-y-2">
              <p><span className="font-bold">DATE:</span> {currentDate}</p>
              <p><span className="font-bold">FACTURE N°:</span> {invoiceNumber}</p>
            </div>
          </div>
          <div className="p-4 bg-gray-50">
            <h3 className="font-bold mb-2">CLIENT:</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-bold">Nom:</span> {client?.company_name || client?.contact_name || "Client comptoir"}</p>
              <p><span className="font-bold">Téléphone:</span> {client?.phone || ""}</p>
              <p><span className="font-bold">Adresse:</span> {client?.address || "Madina C/Matam"}</p>
              <p><span className="font-bold">Email:</span> {client?.email || ""}</p>
              {client?.client_code && <p><span className="font-bold">Code:</span> {client.client_code}</p>}
            </div>
          </div>
        </div>
        
        {/* Products table */}
        <div className="border-b border-gray-400">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400">
                <th className="border-r border-gray-400 p-3 text-left text-sm font-bold">Produit</th>
                <th className="border-r border-gray-400 p-3 text-center text-sm font-bold">Prix unitaire</th>
                <th className="border-r border-gray-400 p-3 text-center text-sm font-bold">Remise</th>
                <th className="border-r border-gray-400 p-3 text-center text-sm font-bold">Prix net</th>
                <th className="border-r border-gray-400 p-3 text-center text-sm font-bold">Qté</th>
                <th className="border-r border-gray-400 p-3 text-center text-sm font-bold">Livré</th>
                <th className="border-r border-gray-400 p-3 text-center text-sm font-bold">Restant</th>
                <th className="p-3 text-center text-sm font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item, index) => {
                const itemPrice = item.price;
                const itemDiscount = item.discount || 0;
                const netPrice = itemPrice - itemDiscount;
                const totalPrice = netPrice * item.quantity;
                const deliveredQty = item.deliveredQuantity || 0;
                const remainingQty = item.quantity - deliveredQty;
                
                return (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="border-r border-gray-200 p-3 text-sm">{item.name}</td>
                    <td className="border-r border-gray-200 p-3 text-center text-sm">{formatGNF(itemPrice)}</td>
                    <td className="border-r border-gray-200 p-3 text-center text-sm">{itemDiscount > 0 ? formatGNF(itemDiscount) : "-"}</td>
                    <td className="border-r border-gray-200 p-3 text-center text-sm">{formatGNF(netPrice)}</td>
                    <td className="border-r border-gray-200 p-3 text-center text-sm">{item.quantity}</td>
                    <td className="border-r border-gray-200 p-3 text-center text-sm font-bold text-green-600">{deliveredQty}</td>
                    <td className="border-r border-gray-200 p-3 text-center text-sm font-bold text-orange-600">{remainingQty}</td>
                    <td className="p-3 text-center text-sm">{formatGNF(totalPrice)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Summary section */}
        <div className="border-b border-gray-400">
          <div className="flex justify-end p-4">
            <table className="w-80">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-2 text-right font-bold">Montant Total</td>
                  <td className="p-2 text-right">{formatGNF(subtotal)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2 text-right font-bold">Remise</td>
                  <td className="p-2 text-right">{formatGNF(totalDiscount)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="p-2 text-right">Net à Payer</td>
                  <td className="p-2 text-right">{formatGNF(totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Amount in words */}
        <div className="border-b border-gray-400 p-4">
          <p className="text-sm italic">
            <span className="font-bold">Arrêtée la présente facture à la somme de:</span> {formatAmountInWords(totalAmount)}
          </p>
        </div>
        
        {/* Status section */}
        <div className="grid grid-cols-2">
          {/* Payment status */}
          <div className="border-r border-gray-400 p-4">
            <h3 className="font-bold mb-3">Statut de paiement</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Statut:</span>
                <span className={`font-bold ${paymentStatus === 'paid' ? 'text-green-600' : paymentStatus === 'partial' ? 'text-orange-600' : 'text-red-600'}`}>
                  {getPaymentStatusLabel(paymentStatus)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Montant payé:</span>
                <span className="font-bold">{formatGNF(paidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Montant restant:</span>
                <span className="font-bold">{formatGNF(remainingAmount)}</span>
              </div>
            </div>
          </div>
          
          {/* Delivery status and remarks */}
          <div className="p-4">
            <h3 className="font-bold mb-3">Statut de livraison</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span>Statut:</span>
                <span className={`font-bold ${deliveryStatus === 'delivered' ? 'text-green-600' : deliveryStatus === 'partial' ? 'text-orange-600' : 'text-red-600'}`}>
                  {getDeliveryStatusLabel(deliveryStatus)}
                </span>
              </div>
            </div>
            
            {/* Dynamic remarks based on status */}
            {(paymentStatus === 'partial' || deliveryStatus === 'partial') && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-4">
                <div className="text-xs space-y-1">
                  {paymentStatus === 'partial' && (
                    <p className="text-yellow-800">Un paiement partiel a été effectué sur cette facture.</p>
                  )}
                  {deliveryStatus === 'partial' && (
                    <p className="text-yellow-800">Cette commande a été partiellement livrée.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
