
import React from 'react';
import { Client } from '@/types/client';
import { ClientSelector } from '@/components/clients/ClientSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PreorderClientProps {
  client: Client | null;
  onClientChange: (clientId: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  isSubmitting: boolean;
}

export const PreorderClient = ({
  client,
  onClientChange,
  notes,
  onNotesChange,
  isSubmitting
}: PreorderClientProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Informations client</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ClientSelector
          value={client?.id || ''}
          onChange={onClientChange}
          disabled={isSubmitting}
        />
        
        {client && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Nom de contact</Label>
              <div className="p-2 border rounded-md mt-1">{client.contact_name || '—'}</div>
            </div>
            <div>
              <Label>Société</Label>
              <div className="p-2 border rounded-md mt-1">{client.company_name || '—'}</div>
            </div>
            <div>
              <Label>Téléphone</Label>
              <div className="p-2 border rounded-md mt-1">{client.phone || '—'}</div>
            </div>
            <div>
              <Label>Email</Label>
              <div className="p-2 border rounded-md mt-1">{client.email || '—'}</div>
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Notes pour cette précommande..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      </CardContent>
    </Card>
  );
};
