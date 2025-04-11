
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isSelectQueryError } from '@/utils/supabase-helpers';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: string;
  name: string;
  type: string;
}

interface OutcomeEntry {
  id: string;
  amount: number;
  date: string;
  description: string;
  expense_category_id: string;
  receipt_number: string;
  payment_method: string;
  status: string;
  category: Category;
}

export function ExpenseOutcomeTab() {
  const [outcomeEntries, setOutcomeEntries] = useState<OutcomeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOutcomeEntries();
  }, []);

  const fetchOutcomeEntries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('outcome_entries')
        .select(`
          *,
          expense_categories (
            id,
            name,
            type
          )
        `)
        .order('date', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des sorties");
        return;
      }

      // Transform data to handle SelectQueryError
      const transformedData = data.map((item: any) => ({
        id: item.id,
        amount: item.amount,
        description: item.description,
        date: item.date,
        expense_category_id: item.expense_category_id,
        created_at: item.created_at,
        receipt_number: item.receipt_number || "",
        payment_method: item.payment_method || "",
        status: item.status || "completed",
        category: !isSelectQueryError(item.expense_categories) 
          ? { 
              id: item.expense_categories?.id || "", 
              name: item.expense_categories?.name || "Catégorie inconnue", 
              type: item.expense_categories?.type || "expense" 
            }
          : { id: "", name: "Catégorie inconnue", type: "expense" }
      }));

      setOutcomeEntries(transformedData);
    } catch (error) {
      console.error('Error fetching outcome entries:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for rendering category names safely
  const renderCategory = (item: any) => {
    if (!item.category || !item.category.name) {
      return "Catégorie inconnue";
    }
    return item.category.name;
  };

  // Helper function to format payment method
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Espèces';
      case 'bank_transfer':
        return 'Virement bancaire';
      case 'check':
        return 'Chèque';
      case 'mobile_money':
        return 'Mobile Money';
      default:
        return method || '-';
    }
  };

  return (
    <div className="p-4 md:p-6">
      <Card className="overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Sorties de Dépenses</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Mode de paiement</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Chargement des données...
                  </TableCell>
                </TableRow>
              ) : outcomeEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Aucune dépense trouvée
                  </TableCell>
                </TableRow>
              ) : (
                outcomeEntries.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{format(new Date(item.date), "Pp", { locale: fr })}</TableCell>
                    <TableCell>{renderCategory(item)}</TableCell>
                    <TableCell>{item.description || "-"}</TableCell>
                    <TableCell>{formatPaymentMethod(item.payment_method)}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'GNF'
                      }).format(item.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === 'completed' ? 'outline' : 'secondary'}
                      >
                        {item.status === 'completed' ? 'Terminé' : 'En attente'}
                      </Badge>
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
}
