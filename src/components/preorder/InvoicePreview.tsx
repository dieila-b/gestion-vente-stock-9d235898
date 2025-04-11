
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Client } from '@/types/client';
import { CartItem } from '@/types/pos';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export interface InvoicePreviewProps {
  client: Client;
  notes: string;
  onNotesChange: (notes: string) => void;
  onValidate: () => Promise<void>;
  isSubmitting: boolean;
  cart: CartItem[];  // Add missing cart prop
}

export const InvoicePreview = ({ 
  client, 
  notes, 
  onNotesChange, 
  onValidate, 
  isSubmitting,
  cart
}: InvoicePreviewProps) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const date = new Date().toLocaleDateString();

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="border-b pb-6">
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">PRÉCOMMANDE</h1>
            <p className="text-muted-foreground">Date: {date}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">Numéro: (Sera généré)</p>
            <p className="text-muted-foreground">Status: Brouillon</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Informations du fournisseur</h3>
            <p>Votre Entreprise</p>
            <p>Adresse de l'entreprise</p>
            <p>Téléphone / Email</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Informations du client</h3>
            <p>{client.company_name || 'N/A'}</p>
            <p>Contact: {client.contact_name || 'N/A'}</p>
            <p>Tél: {client.phone || 'N/A'}</p>
            <p>Email: {client.email || 'N/A'}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Produits précommandés</h3>
          <div className="overflow-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">Produit</th>
                  <th className="border px-4 py-2 text-right">Prix unitaire</th>
                  <th className="border px-4 py-2 text-right">Quantité</th>
                  <th className="border px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="border px-4 py-2">
                      <div className="font-medium">{item.name}</div>
                      {item.reference && <div className="text-sm text-muted-foreground">Réf: {item.reference}</div>}
                    </td>
                    <td className="border px-4 py-2 text-right">{item.price} DH</td>
                    <td className="border px-4 py-2 text-right">{item.quantity}</td>
                    <td className="border px-4 py-2 text-right font-medium">{(item.price * item.quantity).toFixed(2)} DH</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="border px-4 py-2 text-right font-bold">Total</td>
                  <td className="border px-4 py-2 text-right font-bold">{subtotal.toFixed(2)} DH</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Notes ou instructions spéciales..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-between">
        <p className="text-muted-foreground text-sm">
          Cette précommande sera enregistrée en attente de validation
        </p>
        <Button
          onClick={onValidate}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enregistrement...' : 'Confirmer'}
        </Button>
      </CardFooter>
    </Card>
  );
};
