import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowDownUp, CalendarIcon, Plus, Printer, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
  category: Category;
  receipt_number: string;
  payment_method: string;
  status: string;
}

export default function ExpenseOutcome() {
  const [outcomes, setOutcomes] = useState<OutcomeEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<'date' | 'amount' | 'description'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [date, setDate] = useState<Date>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);

  useEffect(() => {
    fetchOutcomes();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('type', 'expense');
    
    if (error) {
      toast.error("Erreur lors du chargement des catégories");
      return;
    }
    
    setCategories(data);
  };

  const fetchOutcomes = async () => {
    const { data, error } = await supabase
      .from('outcome_entries')
      .select(`
        *,
        category:expense_categories!outcome_entries_expense_category_id_fkey (
          id,
          name,
          type
        )
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erreur lors du chargement des sorties:', error);
      toast.error("Erreur lors du chargement des sorties");
      return;
    }

    setOutcomes(data);
  };

  const addCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Veuillez entrer un nom de catégorie");
      return;
    }

    const { data, error } = await supabase
      .from('expense_categories')
      .insert({
        name: newCategory.trim(),
        type: 'expense'
      })
      .select()
      .single();

    if (error) {
      toast.error("Erreur lors de la création de la catégorie");
      return;
    }

    toast.success("Catégorie créée avec succès");
    setNewCategory("");
    setShowNewCategory(false);
    fetchCategories();
  };

  const sortedOutcomes = [...(outcomes || [])].sort((a, b) => {
    if (sortColumn === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortColumn === 'amount') {
      return sortDirection === 'asc' 
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
    if (sortColumn === 'description') {
      return sortDirection === 'asc'
        ? (a.description || '').localeCompare(b.description || '')
        : (b.description || '').localeCompare(a.description || '');
    }
    return 0;
  });

  const filteredOutcomes = sortedOutcomes.filter(outcome => {
    const searchLower = searchTerm.toLowerCase();
    return (
      outcome.description?.toLowerCase().includes(searchLower) ||
      outcome.category?.name?.toLowerCase().includes(searchLower) ||
      outcome.amount.toString().includes(searchLower) ||
      outcome.receipt_number?.toLowerCase().includes(searchLower)
    );
  });

  const handleSort = (column: 'date' | 'amount' | 'description') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handlePrint = async () => {
    const element = document.getElementById('outcomes-table');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('liste-sorties.pdf');
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    if (!date) {
      toast.error("Veuillez sélectionner une date");
      return;
    }

    const categoryId = formData.get('category')?.toString();
    const paymentMethod = formData.get('payment_method')?.toString();
    const amount = parseFloat(formData.get('amount')?.toString() || '0');
    const description = formData.get('description')?.toString();
    
    if (!categoryId) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }

    if (!paymentMethod) {
      toast.error("Veuillez sélectionner un mode de paiement");
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    const outcomeData = {
      amount,
      date: date.toISOString(),
      description: description || '',
      expense_category_id: categoryId,
      payment_method: paymentMethod,
      status: 'completed' as const
    };

    const { error } = await supabase
      .from('outcome_entries')
      .insert(outcomeData);

    if (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast.error("Erreur lors de l'enregistrement de la sortie");
      return;
    }

    toast.success("Sortie enregistrée avec succès!");
    fetchOutcomes();
    form.reset();
    setDate(undefined);
    setDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gradient animate-fade-in">
              Sorties
            </h1>
            <p className="text-muted-foreground animate-fade-in delay-100">
              Gérez vos sorties d'argent
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Sortie
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Ajouter une sortie</DialogTitle>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant</Label>
                    <div className="relative">
                      <Input 
                        id="amount" 
                        name="amount" 
                        type="number" 
                        className="pl-8"
                        required 
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
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          locale={fr}
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
                        />
                        <Button 
                          type="button" 
                          onClick={addCategory}
                        >
                          Ajouter
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowNewCategory(false)}
                        >
                          Annuler
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Select name="category" required>
                          <SelectTrigger className="flex-1">
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
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nouvelle
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Mode de paiement</Label>
                    <Select name="payment_method" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le mode de paiement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Espèces</SelectItem>
                        <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                        <SelectItem value="check">Chèque</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea name="description" placeholder="Description de la sortie..." />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    Enregistrer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
          </div>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
        </div>

        <Card className="p-6">
          <div className="overflow-x-auto" id="outcomes-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-white/5"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      <ArrowDownUp className={`w-4 h-4 ${sortColumn === 'date' ? 'opacity-100' : 'opacity-30'}`} />
                    </div>
                  </TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-white/5"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center gap-2">
                      Description
                      <ArrowDownUp className={`w-4 h-4 ${sortColumn === 'description' ? 'opacity-100' : 'opacity-30'}`} />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-white/5"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center gap-2">
                      Montant
                      <ArrowDownUp className={`w-4 h-4 ${sortColumn === 'amount' ? 'opacity-100' : 'opacity-30'}`} />
                    </div>
                  </TableHead>
                  <TableHead>Mode de paiement</TableHead>
                  <TableHead>N° Reçu</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOutcomes.map((outcome) => (
                  <TableRow key={outcome.id}>
                    <TableCell>
                      {format(new Date(outcome.date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{outcome.category?.name}</TableCell>
                    <TableCell>{outcome.description}</TableCell>
                    <TableCell>{outcome.amount.toLocaleString('fr-FR')} GNF</TableCell>
                    <TableCell>
                      {outcome.payment_method === 'cash' && 'Espèces'}
                      {outcome.payment_method === 'bank_transfer' && 'Virement bancaire'}
                      {outcome.payment_method === 'check' && 'Chèque'}
                      {outcome.payment_method === 'mobile_money' && 'Mobile Money'}
                    </TableCell>
                    <TableCell>{outcome.receipt_number}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        outcome.status === 'completed' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      )}>
                        {outcome.status === 'completed' ? 'Terminé' : 'En attente'}
                      </span>
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
