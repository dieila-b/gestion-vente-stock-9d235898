
import { InvoiceHeader as HeaderComponent } from "../dynamic/InvoiceHeader";

interface InvoiceHeaderSectionProps {
  invoiceNumber: string;
  date: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientCode?: string;
  supplierNumber?: string;
}

export function InvoiceHeaderSection({ 
  invoiceNumber, 
  date, 
  clientName, 
  clientEmail,
  clientPhone,
  clientAddress,
  clientCode,
  supplierNumber
}: InvoiceHeaderSectionProps) {
  return (
    <div className="space-y-0 text-black">
      <div className="flex border-b border-black">
        <div className="w-1/4 p-3 border-r border-black">
          <img 
            src="/lovable-uploads/959478b8-493c-44d8-ae11-c874557f5d54.png" 
            alt="Logo" 
            className="w-16 h-16 object-contain"
          />
        </div>
        <div className="w-3/4 p-3">
          <h2 className="font-bold mb-1">Information de la société</h2>
          <p><strong>Nom:</strong> Ets Aicha Business Alphaya</p>
          <p><strong>Adresse:</strong> Madina-Gare routière Kankan C/Matam</p>
          <p><strong>Téléphone:</strong> +224 613 98 11 24 / 625 72 76 93</p>
          <p><strong>Email:</strong> etsaichabusinessalphaya@gmail.com</p>
        </div>
      </div>
      
      <div className="bg-white p-2 border-b border-black font-bold text-xl">
        FACTURE
      </div>
      
      <div className="flex border-b border-black">
        <div className="w-1/2 p-3 border-r border-black">
          <p><strong>DATE:</strong> {date}</p>
          <p><strong>FACTURE N°:</strong> {invoiceNumber}</p>
          {supplierNumber && <p><strong>FOURNISSEUR N°:</strong> {supplierNumber}</p>}
        </div>
        <div className="w-1/2 p-3">
          <p><strong>CLIENT:</strong></p>
          <p><strong>Nom:</strong> {clientName}</p>
          {clientPhone && <p><strong>Téléphone:</strong> {clientPhone}</p>}
          <p><strong>Adresse:</strong> {clientAddress}</p>
          {clientEmail && <p><strong>Email:</strong> {clientEmail}</p>}
          {clientCode && <p><strong>Code:</strong> {clientCode}</p>}
        </div>
      </div>
    </div>
  );
}
