
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CartItem } from '@/types/pos';
import { Client } from '@/types/client';

interface InvoicePreviewProps {
  client: Client;
  notes: string;
  onNotesChange: React.Dispatch<React.SetStateAction<string>>;
  onValidate: () => Promise<void>;
  isSubmitting: boolean;
}

export function InvoicePreview({
  client,
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
