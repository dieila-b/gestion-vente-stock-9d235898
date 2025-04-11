
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatGNF } from "@/lib/currency";
import { Plus, X } from "lucide-react";
import { ExpenseIncomePrintDialog } from "./ExpenseIncomePrintDialog";
import { addCashRegisterTransaction } from "@/api/cash-register-api";

export function ExpenseIncomeTab() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newIncome, setNewIncome] = useState({
    amount: "",
    description: "",
    category_id: "",
    date: new Date().toISOString().split('T')[0],
  });

  // Query pour récupérer la caisse active
  const { data: activeCashRegister } = useQuery({
    queryKey: ['active-cash-register'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: incomes = [], refetch } = useQuery({
    queryKey: ['income-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income_entries')
        .select(`
          *,
          expense_categories (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des entrées");
        throw error;
      }

      return data;
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const handleAddIncome = async () => {
    if (!newIncome.amount || !newIncome.category_id || !newIncome.date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!activeCashRegister) {
      toast.error("Aucune caisse active trouvée");
      return;
    }

    try {
      // Commencer une transaction Supabase
      // 1. Ajouter l'entrée
      const { data: incomeEntry, error: incomeError } = await supabase
        .from('income_entries')
        .insert({ 
          amount: parseFloat(newIncome.amount),
          description: newIncome.description || null,
          category_id: newIncome.category_id,
          date: newIncome.date
        })
        .select()
        .single();

      if (incomeError) throw incomeError;

      // 2. Créer la transaction de caisse
      await addCashRegisterTransaction(
        activeCashRegister.id,
        'deposit',
        parseFloat(newIncome.amount),
        `Entrée de caisse: ${newIncome.description || 'Sans description'}`
      );

      toast.success("Entrée ajoutée avec succès");
      setNewIncome({ amount: "", description: "", category_id: "", date: new Date().toISOString().split('T')[0] });
      setIsFormVisible(false);
      refetch();
    } catch (error) {
      console.error('Error adding income:', error);
      toast.error("Erreur lors de l'ajout de l'entrée");
    }
  };

  // Formater les données pour l'impression
  const printableIncomes = incomes.map(income => {
    // Handle case when expense_categories might be a SelectQueryError
    const categoryName = income.expense_categories && typeof income.expense_categories === 'object' && !('error' in income.expense_categories)
      ? (income.expense_categories.name || "Non catégorisé")
      : "Non catégorisé";
    
    return {
      id: income.id,
      date: income.created_at,
      category: { name: categoryName },
      description: income.description,
      amount: income.amount
    };
  });

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex justify-between items-start gap-4">
        {!isFormVisible && (
          <Button 
            onClick={() => setIsFormVisible(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle entrée
          </Button>
        )}
        
        <ExpenseIncomePrintDialog entries={printableIncomes} title="Liste des Entrées" />
      </div>

      {isFormVisible && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Nouvelle entrée</CardTitle>
              <CardDescription>
                Enregistrer une nouvelle entrée financière
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsFormVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Montant"
                  value={newIncome.amount}
                  onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newIncome.category_id}
                  onChange={(e) => setNewIncome({ ...newIncome, category_id: e.target.value })}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                type="date"
                value={newIncome.date}
                onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
              />
              <Textarea
                placeholder="Description (optionnel)"
                value={newIncome.description}
                onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
              />
              <Button onClick={handleAddIncome} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter l'entrée
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des entrées</CardTitle>
          <CardDescription>
            Historique de toutes les entrées financières
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.map((income) => {
                // Handle case when expense_categories might be a SelectQueryError
                const categoryName = income.expense_categories && typeof income.expense_categories === 'object' && !('error' in income.expense_categories)
                  ? (income.expense_categories.name || "Non catégorisé")
                  : "Non catégorisé";
                
                return (
                  <TableRow key={income.id}>
                    <TableCell>
                      {new Date(income.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{income.description}</TableCell>
                    <TableCell>{categoryName}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatGNF(income.amount)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
