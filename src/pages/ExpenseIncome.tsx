import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExpenseIncomePrintDialog } from "@/components/expenses/ExpenseIncomePrintDialog";

interface Category {
  id: string;
  name: string;
  type: string;
}

interface IncomeEntry {
  id: string;
  amount: number;
  date: string;
  category: Category;
  description: string;
}

export default function ExpenseIncome() {
  const [date, setDate] = useState<Date>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchIncomeEntries();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('type', 'income');
    
    if (error) {
      toast.error("Erreur lors du chargement des catégories");
      return;
    }
    
    setCategories(data);
  };

  const fetchIncomeEntries = async () => {
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

    setIncomeEntries(data.map(entry => ({
      ...entry,
      category: entry.expense_categories
    })));
  };

  const addCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Le nom de la catégorie ne peut pas être vide");
      return;
    }

    const { data, error } = await supabase
      .from('expense_categories')
      .insert([
        { name: newCategory.trim(), type: 'income' }
      ])
      .select()
      .single();

    if (error) {
      toast.error("Erreur lors de l'ajout de la catégorie");
      return;
    }

    toast.success("Catégorie ajoutée avec succès");
    setCategories([...categories, data]);
    setNewCategory("");
    setShowNewCategory(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !selectedCategory || !amount) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const { error } = await supabase
      .from('income_entries')
      .insert({
        amount: parseFloat(amount),
        date: date.toISOString(),
        category_id: selectedCategory,
        description
      });

    if (error) {
      toast.error("Erreur lors de l'enregistrement de l'entrée");
      return;
    }

    toast.success("Entrée enregistrée avec succès!");
    setAmount("");
    setDescription("");
    setDate(undefined);
    setSelectedCategory(undefined);
    setDialogOpen(false);
    fetchIncomeEntries();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gradient animate-fade-in">
              Entrées
            </h1>
            <p className="text-muted-foreground animate-fade-in delay-100">
              Gérez vos entrées d'argent
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Entrée
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Ajouter une entrée</DialogTitle>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant</Label>
                    <div className="relative">
                      <Input 
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        className="pl-8 enhanced-glass"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                        GNF
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal enhanced-glass",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 enhanced-glass" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          locale={fr}
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    {showNewCategory ? (
                      <div className="flex gap-2">
                        <Input
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Nouvelle catégorie"
                          className="enhanced-glass"
                        />
                        <Button 
                          type="button" 
                          onClick={addCategory}
                          className="enhanced-glass"
                        >
                          Ajouter
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowNewCategory(false)}
                          className="enhanced-glass"
                        >
                          Annuler
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                        >
                          <SelectTrigger className="enhanced-glass flex-1">
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => setShowNewCategory(true)}
                          className="enhanced-glass whitespace-nowrap"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nouvelle
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea 
                      placeholder="Description de l'entrée..."
                      className="enhanced-glass"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="enhanced-glass"
                    onClick={() => setDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="enhanced-glass">
                    Enregistrer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6 enhanced-glass">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Liste des Entrées</h2>
            <ExpenseIncomePrintDialog entries={incomeEntries} title="Liste des Entrées" />
          </div>
          <div className="rounded-md border">
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
                {incomeEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{format(new Date(entry.date), "Pp", { locale: fr })}</TableCell>
                    <TableCell>{entry.category.name}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'GNF'
                      }).format(entry.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
