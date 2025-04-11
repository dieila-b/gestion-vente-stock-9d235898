
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ExpenseIncomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function ExpenseIncomeDialog({ isOpen, onClose, onSubmit }: ExpenseIncomeDialogProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch income categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['income-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('type', 'income')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  // Create income entry mutation
  const createIncomeMutation = useMutation({
    mutationFn: async (values: {
      amount: number;
      description: string;
      category_id: string;
      date: string; // Adding required date field
    }) => {
      const { data, error } = await supabase
        .from('income_entries')
        .insert([values])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Revenu enregistré avec succès");
      queryClient.invalidateQueries({ queryKey: ['income-entries'] });
      onSubmit();
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating income entry:', error);
      toast.error("Erreur lors de l'enregistrement du revenu");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !categoryId) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createIncomeMutation.mutateAsync({
        amount: parseFloat(amount),
        description,
        category_id: categoryId,
        date: new Date().toISOString() // Current date as ISO string
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCategoryId("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un revenu</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Montant *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Montant"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select 
              value={categoryId} 
              onValueChange={setCategoryId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {isCategoriesLoading ? (
                  <SelectItem value="loading" disabled>Chargement...</SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description optionnelle"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
