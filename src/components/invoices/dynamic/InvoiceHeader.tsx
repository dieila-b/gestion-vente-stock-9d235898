
interface InvoiceHeaderProps {
  invoiceNumber: string;
  date: string;
  clientName?: string;
  clientEmail?: string;
  clientCode?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientContactName?: string;  // Added contact name
  code?: string;
  companyInfo?: {
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  supplierNumber?: string;
}

export function InvoiceHeader({ 
  invoiceNumber, 
  date, 
  clientName, 
  clientEmail,
  clientCode,
  clientPhone,
  clientAddress,
  clientContactName,  // Added contact name
  code,
  companyInfo,
  supplierNumber
}: InvoiceHeaderProps) {
  return (
    <div className="space-y-0 text-black">
      <div className="grid grid-cols-2 gap-0 border-b border-black">
        {/* Company Logo */}
        <div className="border-r border-black p-4">
          <img 
            src="/lovable-uploads/a4c01cc2-c7e7-4877-b12e-00121b9e346b.png" 
            alt="Company Logo"
            className="h-24 object-contain" 
          />
        </div>

        {/* Company Info */}
        <div className="p-4">
          <h2 className="font-bold text-lg mb-2">Information de la société</h2>
          <div className="space-y-1">
            <p><span className="font-bold">Nom:</span> {companyInfo?.name || "Ets Aicha Business Alphaya"}</p>
            <p><span className="font-bold">Adresse:</span> {companyInfo?.address || "Madina-Gare routière Kankan C/Matam"}</p>
            <p><span className="font-bold">Téléphone:</span> {companyInfo?.phone || "+224 613 98 11 24 / 625 72 76 93"}</p>
            <p><span className="font-bold">Email:</span> {companyInfo?.email || "etsaichabusinessalphaya@gmail.com"}</p>
          </div>
        </div>
      </div>

      {/* Invoice Title */}
      <div className="border-b border-black p-2">
        <h1 className="text-xl font-bold text-black">FACTURE</h1>
      </div>
      
      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-0">
        <div className="p-4 space-y-2">
          <p><span className="font-bold">DATE:</span> {date}</p>
          <p><span className="font-bold">FACTURE N°:</span> {invoiceNumber}</p>
          {supplierNumber && (
            <p><span className="font-bold">N° Fournisseur:</span> {supplierNumber}</p>
          )}
        </div>
        
        {(clientName || clientEmail || clientPhone || clientAddress || code) && (
          <div className="bg-gray-100 p-4 border-l border-black">
            <h3 className="font-bold mb-2 text-black">CLIENT:</h3>
            <div className="space-y-1 text-black">
              {clientName && <p><span className="font-bold">Nom:</span> {clientName}</p>}
              {clientPhone && (
                <p><span className="font-bold">Téléphone:</span> {clientPhone}</p>
              )}
              {clientAddress && <p><span className="font-bold">Adresse:</span> {clientAddress}</p>}
              {clientEmail && <p><span className="font-bold">Email:</span> {clientEmail}</p>}
              {(clientCode || code) && <p><span className="font-bold">Code:</span> {clientCode || code}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export type { InvoiceHeaderProps };
