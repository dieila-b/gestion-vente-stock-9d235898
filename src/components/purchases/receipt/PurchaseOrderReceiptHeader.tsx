
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PurchaseOrderReceiptHeaderProps {
  orderNumber: string;
  createdAt: string;
  supplier: {
    name: string;
    phone?: string | null;
    email?: string | null;
  };
}

export function PurchaseOrderReceiptHeader({ 
  orderNumber, 
  createdAt, 
  supplier 
}: PurchaseOrderReceiptHeaderProps) {
  return (
    <>
      {/* Header with company and supplier info */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        {/* Company Logo */}
        <div className="border border-gray-200 rounded p-4 bg-white">
          <img 
            src="/lovable-uploads/337943a6-b395-488d-9eab-65668ecded76.png" 
            alt="Company Logo"
            className="h-16 object-contain"
          />
        </div>

        {/* Company Info */}
        <div className="border border-gray-200 rounded p-4 bg-white">
          <h2 className="font-bold text-base mb-1">Information de la société</h2>
          <div className="space-y-0 text-sm">
            <p><span className="font-semibold">Nom:</span> Démo</p>
            <p><span className="font-semibold">Adresse:</span> Abidjan</p>
            <p><span className="font-semibold">Numéro de téléphone:</span> +225 05 55 95 45 33</p>
            <p><span className="font-semibold">Adresse email:</span> demo@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Invoice Title and Main Info */}
      <div className="mb-6">
        <h1 className="text-base font-bold uppercase mb-1">FACTURE FOURNISSEUR</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 text-sm">
            <p><span className="font-bold">DATE: </span>{format(new Date(createdAt), "dd/MM/yyyy", { locale: fr })}</p>
            <p><span className="font-bold">FACTURE N°: </span>{orderNumber}</p>
            <p><span className="font-bold">N° Fournisseur: </span>{orderNumber}</p>
          </div>
          
          <div className="bg-gray-300 p-2">
            <h2 className="font-bold mb-1">FOURNISSEUR:</h2>
            <div className="space-y-1">
              <p><span className="font-bold">Nom & Prénom: </span>{supplier.name}</p>
              <p><span className="font-bold">Mobil: </span>{supplier.phone || "Non spécifié"}</p>
              <p><span className="font-bold">Email: </span>{supplier.email || "Non spécifié"}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
