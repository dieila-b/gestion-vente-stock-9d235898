
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientSelector } from '@/components/clients/ClientSelector';
import { Client } from '@/types/client';

interface PreorderClientProps {
  client: Client | null;
  onClientChange: (client: Client) => void;
}

export function PreorderClient({ client, onClientChange }: PreorderClientProps) {
  const handleClientChange = (clientId: string) => {
    // This is a simplified version - in a real app, you might need to
    // fetch the full client object from an API or context
    if (clientId) {
      // For now, we'll assume the ClientSelector component manages this correctly
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client</CardTitle>
      </CardHeader>
      <CardContent>
        <ClientSelector 
          value={client?.id || ''} 
          onChange={handleClientChange}
        />
        
        {client && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <div className="font-medium">{client.company_name || client.contact_name}</div>
            {client.address && <div className="text-sm text-muted-foreground">{client.address}</div>}
            {client.phone && <div className="text-sm text-muted-foreground">Tél: {client.phone}</div>}
            {client.email && <div className="text-sm text-muted-foreground">Email: {client.email}</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
