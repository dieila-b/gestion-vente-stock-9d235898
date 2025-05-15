
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
import { safeGet } from "@/utils/data-safe/safe-access";

export function ExpenseOutcomeTab() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newOutcome, setNewOutcome] = useState({
    amount: "",
    description: "",
    category_id: "",
  });

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

  const { data: outcomes = [], refetch } = useQuery({
    queryKey: ['expense-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_entries')
        .select(`
          *,
          expense_categories!expense_entries_expense_category_id_fkey (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des sorties");
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
        .eq('type', 'expense')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const handleAddOutcome = async () => {
    if (!newOutcome.amount || !newOutcome.category_id) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!activeCashRegister) {
      toast.error("Aucune caisse active trouvée");
      return;
    }

    try {
      const { data: outcomeEntry, error: outcomeError } = await supabase
        .from('expense_entries')
        .insert({ 
          amount: parseFloat(newOutcome.amount),
          description: newOutcome.description || null,
          expense_category_id: newOutcome.category_id
        })
        .select()
        .single();

      if (outcomeError) throw outcomeError;

      await addCashRegisterTransaction(
        activeCashRegister.id,
        'withdrawal',
        parseFloat(newOutcome.amount),
        `Sortie de caisse: ${newOutcome.description || 'Sans description'}`
      );

      toast.success("Sortie ajoutée avec succès");
      setNewOutcome({ amount: "", description: "", category_id: "" });
      setIsFormVisible(false);
      refetch();
    } catch (error) {
      console.error('Error adding outcome:', error);
      toast.error("Erreur lors de l'ajout de la sortie");
    }
  };

  const printableOutcomes = outcomes.map(outcome => ({
    id: outcome.id,
    date: outcome.created_at,
    category: { name: safeGet(outcome.expense_categories, 'name', 'Non catégorisé') },
    description: outcome.description,
    amount: outcome.amount
  }));

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex justify-between items-start gap-4">
        {!isFormVisible && (
          <Button 
            onClick={() => setIsFormVisible(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle sortie
          </Button>
        )}
        
        <ExpenseIncomePrintDialog entries={printableOutcomes} title="Liste des Sorties" />
      </div>

      {isFormVisible && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Nouvelle sortie</CardTitle>
              <CardDescription>
                Enregistrer une nouvelle sortie financière
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
                  value={newOutcome.amount}
                  onChange={(e) => setNewOutcome({ ...newOutcome, amount: e.target.value })}
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newOutcome.category_id}
                  onChange={(e) => setNewOutcome({ ...newOutcome, category_id: e.target.value })}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <Textarea
                placeholder="Description (optionnel)"
                value={newOutcome.description}
                onChange={(e) => setNewOutcome({ ...newOutcome, description: e.target.value })}
              />
              <Button onClick={handleAddOutcome} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter la sortie
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des sorties</CardTitle>
          <CardDescription>
            Historique de toutes les sorties financières
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
              {outcomes.map((outcome) => (
                <TableRow key={outcome.id}>
                  <TableCell>
                    {new Date(outcome.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{outcome.description}</TableCell>
                  <TableCell>{safeGet(outcome.expense_categories, 'name', 'Non catégorisé')}</TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    {formatGNF(outcome.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
