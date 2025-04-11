
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatGNF } from '@/lib/currency';
import { Client } from '@/types/client';
import { CartItem } from '@/types/pos';
import { Printer, X, Download } from 'lucide-react';

interface InvoicePreviewProps {
  preorderId: string;
  client: Client;
  items: CartItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  onClose: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  preorderId,
  client,
  items,
  totalAmount,
  paidAmount,
  remainingAmount,
  status,
  onClose
}) => {
  const formattedDate = format(new Date(), 'dd/MM/yyyy', { locale: fr });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-white">
        <div className="flex justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">Précommande #{preorderId.substring(0, 8)}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="mb-8 grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-2">Informations du Vendeur</h3>
              <p className="text-sm">Ets Aicha Business Alphaya</p>
              <p className="text-sm">Madina-Gare routière Kankan C/Matam</p>
              <p className="text-sm">+224 613 98 11 24 / 625 72 76 93</p>
              <p className="text-sm">etsaichabusinessalphaya@gmail.com</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Informations du Client</h3>
              <p className="text-sm">{client.company_name || 'Client particulier'}</p>
              {client.contact_name && <p className="text-sm">{client.contact_name}</p>}
              {client.phone && <p className="text-sm">{client.phone}</p>}
              {client.email && <p className="text-sm">{client.email}</p>}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold mb-2">Détails de la Précommande</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm"><span className="font-medium">Date:</span> {formattedDate}</p>
                <p className="text-sm"><span className="font-medium">Numéro de Précommande:</span> {preorderId.substring(0, 8)}</p>
                <p className="text-sm"><span className="font-medium">Statut:</span> {status}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold mb-2">Articles</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Produit</th>
                  <th className="border p-2 text-right">Prix Unitaire</th>
                  <th className="border p-2 text-center">Quantité</th>
                  <th className="border p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const itemTotal = item.price * item.quantity;
                  return (
                    <tr key={item.id}>
                      <td className="border p-2">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.reference && <p className="text-xs text-muted-foreground">Réf: {item.reference}</p>}
                        </div>
                      </td>
                      <td className="border p-2 text-right">{formatGNF(item.price)}</td>
                      <td className="border p-2 text-center">{item.quantity}</td>
                      <td className="border p-2 text-right">{formatGNF(itemTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="border p-2 text-right font-bold">Total</td>
                  <td className="border p-2 text-right font-bold">{formatGNF(totalAmount)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="border p-2 text-right">Montant Payé</td>
                  <td className="border p-2 text-right">{formatGNF(paidAmount)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="border p-2 text-right">Montant Restant</td>
                  <td className="border p-2 text-right">{formatGNF(remainingAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="border-t pt-4 mt-8 text-center text-sm text-gray-500">
            <p>Merci pour votre commande!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicePreview;
