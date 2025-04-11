
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ExpenseOutcomeDialog } from '@/components/expenses/ExpenseOutcomeDialog';
import { Category } from '@/pages/ExpenseIncome';
import { isSelectQueryError } from '@/utils/supabase-helpers';
import { getSafeCategory } from '@/utils/error-handlers';

export interface OutcomeEntry {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: Category;
  receipt_number?: string;
  payment_method?: string;
  status?: string;
}

export default function ExpenseOutcome() {
  const [isAddOutcomeOpen, setIsAddOutcomeOpen] = useState(false);
  const [outcomeEntries, setOutcomeEntries] = useState<OutcomeEntry[]>([]);

  const { data: entriesData, isLoading, error, refetch } = useQuery({
    queryKey: ['outcome-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outcome_entries')
        .select(`
          *,
          category: expense_categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (entriesData) {
      // Map the entries, handling SelectQueryErrors properly
      const mappedEntries = entriesData.map(entry => {
        // Create a default category to use when there's an error
        const defaultCategory: Category = {
          id: 'unknown',
          name: 'Catégorie inconnue',
          type: 'expense'
        };

        // Safely handle the category property which might be a SelectQueryError
        const category = isSelectQueryError(entry.category) 
          ? defaultCategory 
          : (entry.category as Category) || defaultCategory;

        return {
          id: entry.id,
          amount: entry.amount,
          date: entry.created_at,
          description: entry.description,
          category: category,
          receipt_number: entry.receipt_number,
          payment_method: entry.payment_method,
          status: entry.status
        };
      });

      setOutcomeEntries(mappedEntries);
    }
  }, [entriesData]);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Dépenses et Sorties</h1>
            <p className="text-muted-foreground">
              Gérer les dépenses et suivre les sorties d'argent
            </p>
          </div>
          <Button onClick={() => setIsAddOutcomeOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Dépense
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Dépenses</CardTitle>
            <CardDescription>
              Toutes les dépenses et sorties d'argent du commerce
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Chargement des données...</p>
            ) : error ? (
              <p className="text-red-500">
                Erreur: {(error as Error).message}
              </p>
            ) : outcomeEntries.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Aucune dépense trouvée
              </p>
            ) : (
              <div className="space-y-4">
                {outcomeEntries.map(entry => (
                  <div
                    key={entry.id}
                    className="p-4 border rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{entry.description}</div>
                      <div className="text-muted-foreground text-sm">
                        {new Date(entry.date).toLocaleDateString()} - {entry.category.name}
                        {entry.payment_method && ` - ${entry.payment_method}`}
                      </div>
                      {entry.receipt_number && (
                        <div className="text-xs text-muted-foreground">
                          Reçu: {entry.receipt_number}
                        </div>
                      )}
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      {entry.amount.toLocaleString()} GNF
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {isAddOutcomeOpen && (
          <ExpenseOutcomeDialog
            isOpen={isAddOutcomeOpen}
            onClose={() => setIsAddOutcomeOpen(false)}
            onSubmit={() => {
              refetch();
              setIsAddOutcomeOpen(false);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
