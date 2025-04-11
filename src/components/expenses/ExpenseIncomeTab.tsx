
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isSelectQueryError } from '@/utils/supabase-helpers';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  type: string;
}

interface IncomeEntry {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: Category;
}

export const ExpenseIncomeTab: React.FC = () => {
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIncomeEntries();
  }, []);

  const fetchIncomeEntries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('income_entries')
        .select(`
          id,
          amount,
          date,
          description,
          expense_categories (
            id,
            name,
            type
          )
        `)
        .order('date', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des entrées");
        return;
      }

      // Transform data to handle SelectQueryError
      const transformedData = data.map((income: any) => ({
        id: income.id,
        amount: income.amount,
        date: income.date,
        description: income.description,
        category: !isSelectQueryError(income.expense_categories) 
          ? { 
              id: income.expense_categories?.id || "", 
              name: income.expense_categories?.name || "Catégorie inconnue", 
              type: income.expense_categories?.type || "income" 
            }
          : { id: "", name: "Catégorie inconnue", type: "income" }
      }));

      setIncomeEntries(transformedData);
    } catch (error) {
      console.error('Error fetching income entries:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for rendering category names safely
  const renderCategory = (income: any) => {
    if (!income.category || !income.category.name) {
      return "Catégorie inconnue";
    }
    return income.category.name;
  };

  return (
    <div className="p-4 md:p-6">
      <Card className="overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Entrées de Revenus</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Chargement des données...
                  </TableCell>
                </TableRow>
              ) : incomeEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Aucune entrée trouvée
                  </TableCell>
                </TableRow>
              ) : (
                incomeEntries.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>{format(new Date(income.date), "Pp", { locale: fr })}</TableCell>
                    <TableCell>{renderCategory(income)}</TableCell>
                    <TableCell>{income.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'GNF'
                      }).format(income.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
