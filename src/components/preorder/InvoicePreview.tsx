
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CartItem } from '@/types/pos';
import { Client } from '@/types/client';

interface InvoicePreviewProps {
  client: Client;
  cart: CartItem[];
  notes: string;
  onNotesChange: React.Dispatch<React.SetStateAction<string>>;
  onValidate: () => Promise<void>;
  isSubmitting: boolean;
}

export function InvoicePreview({
  client,
  cart,
  notes,
  onNotesChange,
  isSubmitting
}: InvoicePreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aperçu de la précommande</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg">Informations client</h3>
              <p className="font-medium">{client.company_name || client.contact_name}</p>
              {client.address && <p>{client.address}</p>}
              {client.city && client.postal_code && (
                <p>
                  {client.postal_code} {client.city}
                </p>
              )}
              {client.phone && <p>Tél: {client.phone}</p>}
              {client.email && <p>Email: {client.email}</p>}
            </div>
            
            <div>
              <h3 className="font-semibold text-lg">Date</h3>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {cart && cart.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-2">Articles</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qté</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cart.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{item.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{item.quantity}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{item.price.toLocaleString()} GNF</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{(item.price * item.quantity).toLocaleString()} GNF</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Notes supplémentaires (facultatif)"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
