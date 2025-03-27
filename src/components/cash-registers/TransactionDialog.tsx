
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  register: any;
  transactionType: 'deposit' | 'withdrawal';
}

export function TransactionDialog({ 
  open, 
  onOpenChange, 
  register, 
  transactionType 
}: TransactionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;

    try {
      const { error } = await supabase
        .from('cash_register_transactions')
        .insert([
          {
            cash_register_id: register.id,
            type: transactionType,
            amount,
            description,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `${transactionType === 'deposit' ? 'Le dépôt' : 'Le retrait'} a été effectué avec succès`,
      });

      onOpenChange(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transactions', register.id] }),
        queryClient.invalidateQueries({ queryKey: ['cashRegisters'] })
      ]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {transactionType === 'deposit' ? 'Effectuer un dépôt' : 'Effectuer un retrait'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleTransaction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Montant</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              required
              className="enhanced-glass"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Description de la transaction..."
              className="enhanced-glass"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className={`w-full ${
              transactionType === 'deposit' 
                ? 'hover:bg-green-500/10' 
                : 'hover:bg-red-500/10'
            } enhanced-glass`}
          >
            {isSubmitting 
              ? "Traitement..." 
              : transactionType === 'deposit' 
                ? "Effectuer le dépôt" 
                : "Effectuer le retrait"
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
