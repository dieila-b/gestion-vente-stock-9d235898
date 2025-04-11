
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { QuoteForm } from '@/components/quotes/QuoteForm';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

interface Quote {
  id: string;
  quote_number: string;
  client_id: string;
  issue_date: string;
  expiry_date: string;
  total_amount: number;
  status: string;
  notes?: string;
  client?: {
    company_name: string;
  };
}

export default function Quotes() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          client:clients(company_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Quote[];
    }
  });

  const filteredQuotes = quotes.filter(quote => 
    quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quote.client?.company_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Devis</h1>
          <Button onClick={() => setShowForm(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Nouveau Devis
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un devis..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {showForm ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Créer un Nouveau Devis</CardTitle>
            </CardHeader>
            <CardContent>
              <QuoteForm onClose={() => setShowForm(false)} />
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <p>Chargement des devis...</p>
          ) : filteredQuotes.length > 0 ? (
            filteredQuotes.map((quote) => (
              <Card key={quote.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between">
                    <span>{quote.quote_number}</span>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${getStatusColor(quote.status)}`}>
                      {getStatusLabel(quote.status)}
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{quote.client?.company_name || 'Client inconnu'}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Date d'émission:</span>
                      <span>{new Date(quote.issue_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Date d'expiration:</span>
                      <span>{new Date(quote.expiry_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between font-medium mt-2">
                      <span>Montant total:</span>
                      <span>{formatAmount(quote.total_amount)}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm">
                      Voir détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>Aucun devis trouvé</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'draft':
      return 'Brouillon';
    case 'sent':
      return 'Envoyé';
    case 'accepted':
      return 'Accepté';
    case 'rejected':
      return 'Refusé';
    default:
      return status;
  }
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
