
import { DeliveryNote } from "@/types/delivery-note";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatGNF } from "@/lib/currency";
import React from "react";

interface DeliveryNotePrintContentProps {
  note: DeliveryNote;
  subtotal: number;
  printRef: React.RefObject<HTMLDivElement>;
}

export function DeliveryNotePrintContent({ 
  note, 
  subtotal, 
  printRef 
}: DeliveryNotePrintContentProps) {
  const formattedDate = note.created_at 
    ? format(new Date(note.created_at), "dd/MM/yyyy", { locale: fr })
    : "";

  return (
    <div 
      ref={printRef} 
      className="bg-white text-black print:bg-white print:text-black p-8 max-w-[210mm] mx-auto"
      style={{
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box'
      }}
    >
      {/* Header with logo and company info */}
      <div className="flex justify-between mb-8">
        {/* Logo */}
        <div>
          <img 
            src="/lovable-uploads/53b59c10-30fb-41ac-a364-dc6d7f29e78c.png" 
            alt="Company Logo"
            className="h-16 object-contain"
          />
        </div>

        {/* Company Info */}
        <div className="text-right">
          <h2 className="font-bold">Information de la société</h2>
          <p>Nom: Démo</p>
          <p>Adresse: Abidjan</p>
          <p>Numéro de téléphone: +225 05 55 95 45 33</p>
          <p>Adresse email: demo@gmail.com</p>
        </div>
      </div>

      {/* Delivery Note Header */}
      <div className="flex mb-4">
        <div className="flex-1">
          <h1 className="text-base font-bold uppercase border-b-2 border-black pb-1 mb-2">BON DE LIVRAISON</h1>
          <p><strong>DATE :</strong> {formattedDate}</p>
          <p><strong>FACTURE N° :</strong> {note.delivery_number}</p>
          {/* Use a supplier reference number or alternative identifier instead of supplier.id */}
          <p><strong>N° Fournisseur :</strong> FOUR1723037320</p>
        </div>
        <div className="flex-1">
          <div className="bg-gray-300 p-2">
            <h2 className="font-bold">FOURNISSEUR :</h2>
            <p>{note.supplier.name}</p>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="bg-red-900 text-white">
            <th className="p-2 border border-black">Code</th>
            <th className="p-2 border border-black">Désignation</th>
            <th className="p-2 border border-black">Qté</th>
            <th className="p-2 border border-black">P.U.</th>
            <th className="p-2 border border-black">Remise</th>
            <th className="p-2 border border-black">Montant</th>
          </tr>
        </thead>
        <tbody>
          {note.items.map((item) => {
            const unitPrice = item.unit_price || 0;
            const quantity = item.expected_quantity || item.quantity_ordered || 0;
            const total = unitPrice * quantity;
            return (
              <tr key={item.id}>
                <td className="p-2 border border-black">{item.product?.reference}</td>
                <td className="p-2 border border-black">{item.product?.name}</td>
                <td className="p-2 border border-black text-center">{quantity}</td>
                <td className="p-2 border border-black text-right">{formatGNF(unitPrice)}</td>
                <td className="p-2 border border-black text-center">0</td>
                <td className="p-2 border border-black text-right">{formatGNF(total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <table className="w-1/3 border-collapse">
          <tbody>
            <tr>
              <td className="p-2 font-bold">Montant TTC</td>
              <td className="p-2 border border-black text-right">{formatGNF(subtotal)}</td>
            </tr>
            <tr>
              <td className="p-2 font-bold">Remise</td>
              <td className="p-2 border border-black text-right">0</td>
            </tr>
            <tr>
              <td className="p-2 font-bold">Net à Payer</td>
              <td className="p-2 border border-black text-right">{formatGNF(subtotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
