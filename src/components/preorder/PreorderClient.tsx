
import React from 'react';
import { Client } from '@/types/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientSelector } from '@/components/clients/ClientSelector';

interface PreorderClientProps {
  selectedClient: Client | null;
  onClientChange: (client: Client | null) => void;
}

export const PreorderClient: React.FC<PreorderClientProps> = ({
  selectedClient,
  onClientChange,
}) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Client</CardTitle>
      </CardHeader>
      <CardContent>
        <ClientSelector
          value={selectedClient}
          onChange={onClientChange}
        />
        
        {selectedClient && (
          <div className="mt-4 space-y-1">
            <p className="text-sm font-medium">
              {selectedClient.company_name || 'Client particulier'}
            </p>
            {selectedClient.contact_name && (
              <p className="text-sm text-muted-foreground">
                Contact: {selectedClient.contact_name}
              </p>
            )}
            {selectedClient.phone && (
              <p className="text-sm text-muted-foreground">
                Téléphone: {selectedClient.phone}
              </p>
            )}
            {selectedClient.email && (
              <p className="text-sm text-muted-foreground">
                Email: {selectedClient.email}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PreorderClient;
