
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
  const currentDate = format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: fr });

  // Convert CartItemInfo to InvoiceItem with price and delivery information
  const invoiceItems: InvoiceItem[] = items.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.price || totalAmount / items.reduce((acc, item) => acc + item.quantity, 1), // Use item price if available
    discount: item.discount || 0,
    deliveredQuantity: item.deliveredQuantity
  }));

  // Calculate subtotal and total discount
  const subtotal = invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = invoiceItems.reduce((sum, item) => sum + ((item.discount || 0) * item.quantity), 0);

  if (isReceipt) {
    return (
      <div className="space-y-4">
        {/* Share actions at the top */}
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
      {/* Share actions at the top */}
      <InvoiceShareActions
        invoiceNumber={invoiceNumber}
        clientName={client?.company_name || client?.contact_name || "Client comptoir"}
        clientPhone={client?.phone}
        clientEmail={client?.email}
        totalAmount={totalAmount}
        invoiceRef={invoiceRef}
        formatGNF={formatGNF}
      />
      
      <div className="bg-white rounded-md border border-gray-200" ref={invoiceRef}>
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
            <p className="text-xs"><span className="font-bold">DATE:</span> {currentDate}</p>
            <p className="text-xs"><span className="font-bold">FACTURE N°:</span> {invoiceNumber}</p>
          </div>
          <div className="p-3 bg-gray-50">
            <p className="font-bold text-xs mb-1">CLIENT:</p>
            <p className="text-xs"><span className="font-bold">Adresse:</span> {client?.address || "Madina C/Matam"}</p>
            <p className="text-xs"><span className="font-bold">Email:</span> {client?.email || (client?.contact_name ? `${client?.contact_name.toLowerCase().replace(/\s+/g, '')}@gmail.com` : "client@example.com")}</p>
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
          
          {invoiceItems.map((item, index) => {
            const itemPrice = item.price;
            const itemDiscount = item.discount || 0;
            const netPrice = itemPrice - itemDiscount;
            const totalPrice = netPrice * item.quantity;
            
            return (
              <div key={index} className="grid grid-cols-12 text-xs p-1.5 border-b border-gray-100">
                <div className="col-span-1">
                  {/* Product image or placeholder */}
                  <div className="w-6 h-6 bg-gray-100 flex items-center justify-center rounded">
                    <span className="text-xxs text-gray-500">IMG</span>
                  </div>
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
                  <td className="p-1.5 text-right">{formatGNF(totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Amount in words - REDUCED */}
        <div className="p-2 border-b border-gray-200 text-xs italic">
          Arrêtée la présente facture à la somme de: {formatAmountInWords(totalAmount)}
        </div>
        
        {/* Payment and delivery status - SIMPLIFIED & REDUCED */}
        {(paymentStatus !== 'pending' || deliveryStatus !== 'pending') && (
          <div className="grid grid-cols-2 p-2 border-b border-gray-200 text-xxs">
            {paymentStatus !== 'pending' && (
              <div className="pr-2">
                <h3 className="font-bold mb-0.5">Information de paiement</h3>
                <p>Statut: <span className="font-medium">{getPaymentStatusLabel(paymentStatus)}</span></p>
                {paidAmount > 0 && (
                  <p>Montant payé: <span className="font-medium">{formatGNF(paidAmount)}</span></p>
                )}
                {remainingAmount > 0 && (
                  <p>Reste à payer: <span className="font-medium">{formatGNF(remainingAmount)}</span></p>
                )}
              </div>
            )}
            
            {deliveryStatus !== 'pending' && (
              <div className="pl-2">
                <h3 className="font-bold mb-0.5">Information de livraison</h3>
                <p>Statut: <span className="font-medium">{getDeliveryStatusLabel(deliveryStatus)}</span></p>
              </div>
            )}
          </div>
        )}
        
        {/* Additional client info - SMALLER TEXT */}
        <div className="p-2 text-xs bg-gray-50">
          <p className="mb-0.5"><span className="font-bold">Client:</span> {client?.company_name || client?.contact_name || "Client comptoir"}</p>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert number to words (simplified version)
function formatAmountInWords(amount: number): string {
  // This is a placeholder. In a production app, you would use a proper
  // number-to-words library or implementation like numberToWords from your lib
  return `${formatGNF(amount).replace('GNF', 'Franc Guinéen')}`;
}

// Helper functions to get readable status labels
function getPaymentStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    'paid': 'Payé',
    'partial': 'Partiellement payé',
    'pending': 'En attente'
  };
  return statusMap[status] || status;
}

function getDeliveryStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    'delivered': 'Livré',
    'partial': 'Partiellement livré',
    'awaiting': 'En attente de livraison',
    'pending': 'En attente'
  };
  return statusMap[status] || status;
}
