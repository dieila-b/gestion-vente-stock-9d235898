
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ExpenseIncomeDialog } from '@/components/expenses/ExpenseIncomeDialog';
import { IncomeEntry, Category } from '@/components/expenses/ExpenseIncomeTab';
import { safelyHandleArray } from '@/utils/error-handlers';
import { isSelectQueryError } from '@/utils/supabase-helpers';

export default function ExpenseIncome() {
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);

  const { data: entriesData, isLoading, error, refetch } = useQuery({
    queryKey: ['income-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income_entries')
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
          type: 'income'
        };

        // Safely handle the category property which might be a SelectQueryError
        let category: Category;
        if (isSelectQueryError(entry.category)) {
          category = defaultCategory;
        } else {
          category = (entry.category as Category) || defaultCategory;
        }

        return {
          id: entry.id,
          amount: entry.amount,
          date: entry.created_at,
          description: entry.description,
          category: category
        };
      });

      setIncomeEntries(mappedEntries);
    }
  }, [entriesData]);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Revenus et Entrées</h1>
            <p className="text-muted-foreground">
              Gérer les revenus et suivre les entrées d'argent
            </p>
          </div>
          <Button onClick={() => setIsAddIncomeOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Entrée
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Revenus</CardTitle>
            <CardDescription>
              Tous les revenus et entrées d'argent du commerce
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Chargement des données...</p>
            ) : error ? (
              <p className="text-red-500">
                Erreur: {(error as Error).message}
              </p>
            ) : incomeEntries.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Aucune entrée trouvée
              </p>
            ) : (
              <div className="space-y-4">
                {incomeEntries.map(entry => (
                  <div
                    key={entry.id}
                    className="p-4 border rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{entry.description}</div>
                      <div className="text-muted-foreground text-sm">
                        {new Date(entry.date).toLocaleDateString()} - {entry.category.name}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {entry.amount.toLocaleString()} GNF
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {isAddIncomeOpen && (
          <ExpenseIncomeDialog
            isOpen={isAddIncomeOpen}
            onClose={() => setIsAddIncomeOpen(false)}
            onSuccess={() => {
              refetch();
              setIsAddIncomeOpen(false);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
