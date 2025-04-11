
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
import { isSelectQueryError, safeGetProperty } from "@/utils/supabase-helpers";

// Define the type for an outcome entry
interface OutcomeEntry {
  id: string;
  amount: number;
  description: string;
  category: {
    name: string;
  };
  created_at: string;
  date: string;
  receipt_number: string;
  payment_method: string;
  status: string;
}

// Define a type for the category
interface Category {
  id: string;
  name: string;
  type: string;
}

export function ExpenseOutcomeTab() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newOutcome, setNewOutcome] = useState({
    amount: "",
    description: "",
    expense_category_id: "",
    date: new Date().toISOString().split('T')[0],
    payment_method: "cash",
    receipt_number: "",
    status: "completed"
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

  const { data: outcomes = [], refetch } = useQuery<OutcomeEntry[]>({
    queryKey: ['outcome-entries'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('outcome_entries')
          .select(`
            id,
            amount,
            description,
            created_at,
            expense_category_id,
            date,
            payment_method,
            receipt_number,
            status,
            expense_categories:expense_category_id(
              name
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          toast.error("Erreur lors du chargement des sorties");
          throw error;
        }

        // Transform the data to match the OutcomeEntry interface
        return (data || []).map(item => {
          // Get category name safely
          const categoryName = isSelectQueryError(item.expense_categories) 
            ? "Non catégorisé" 
            : safeGetProperty(item.expense_categories, 'name', "Non catégorisé");
            
          return {
            id: item.id,
            amount: item.amount || 0,
            description: item.description || "",
            created_at: item.created_at,
            date: item.date || item.created_at,
            payment_method: item.payment_method || "cash",
            receipt_number: item.receipt_number || "",
            status: item.status || "completed",
            category: {
              name: categoryName
            }
          };
        });
      } catch (error) {
        console.error('Error fetching outcome entries:', error);
        return [];
      }
    }
  });

  const { data: categories = [] } = useQuery<Category[]>({
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
    if (!newOutcome.amount || !newOutcome.expense_category_id || !newOutcome.date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!activeCashRegister) {
      toast.error("Aucune caisse active trouvée");
      return;
    }

    try {
      // Commencer une transaction Supabase
      // 1. Ajouter la sortie
      const { data: outcomeEntry, error: outcomeError } = await supabase
        .from('outcome_entries')
        .insert({ 
          amount: parseFloat(newOutcome.amount),
          description: newOutcome.description || null,
          expense_category_id: newOutcome.expense_category_id,
          date: newOutcome.date,
          payment_method: newOutcome.payment_method,
          receipt_number: newOutcome.receipt_number || `REC-${Date.now().toString().slice(-6)}`,
          status: newOutcome.status
        })
        .select()
        .single();

      if (outcomeError) throw outcomeError;

      // 2. Créer la transaction de caisse
      await addCashRegisterTransaction(
        activeCashRegister.id,
        'withdrawal',
        parseFloat(newOutcome.amount),
        `Sortie de caisse: ${newOutcome.description || 'Sans description'}`
      );

      toast.success("Sortie ajoutée avec succès");
      setNewOutcome({ 
        amount: "", 
        description: "", 
        expense_category_id: "", 
        date: new Date().toISOString().split('T')[0],
        payment_method: "cash",
        receipt_number: "",
        status: "completed"
      });
      setIsFormVisible(false);
      refetch();
    } catch (error) {
      console.error('Error adding outcome:', error);
      toast.error("Erreur lors de l'ajout de la sortie");
    }
  };

  // Formater les données pour l'impression
  const printableOutcomes = outcomes.map(outcome => ({
    id: outcome.id,
    date: outcome.created_at,
    category: { name: outcome.category?.name || "Non catégorisé" },
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
                  value={newOutcome.expense_category_id}
                  onChange={(e) => setNewOutcome({ ...newOutcome, expense_category_id: e.target.value })}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="date"
                  value={newOutcome.date}
                  onChange={(e) => setNewOutcome({ ...newOutcome, date: e.target.value })}
                />
                <Input
                  type="text"
                  placeholder="Numéro de reçu (optionnel)"
                  value={newOutcome.receipt_number}
                  onChange={(e) => setNewOutcome({ ...newOutcome, receipt_number: e.target.value })}
                />
              </div>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newOutcome.payment_method}
                onChange={(e) => setNewOutcome({ ...newOutcome, payment_method: e.target.value })}
              >
                <option value="cash">Espèces</option>
                <option value="bank">Virement bancaire</option>
                <option value="mobile">Mobile Money</option>
                <option value="check">Chèque</option>
                <option value="other">Autre</option>
              </select>
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
                  <TableCell>{outcome.category?.name || "Non catégorisé"}</TableCell>
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
