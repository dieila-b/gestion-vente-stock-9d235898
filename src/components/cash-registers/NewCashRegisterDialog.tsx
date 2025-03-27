
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function NewCashRegisterDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const initialAmount = parseFloat(formData.get('initialAmount') as string) || 0;

    try {
      const { error } = await supabase
        .from('cash_registers')
        .insert([
          {
            name,
            initial_amount: initialAmount,
            current_amount: initialAmount,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La caisse a été créée avec succès",
      });

      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['cashRegisters'] });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la caisse",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="enhanced-glass">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Caisse
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle caisse</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la caisse</Label>
            <Input
              id="name"
              name="name"
              placeholder="Caisse principale"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="initialAmount">Montant initial</Label>
            <Input
              id="initialAmount"
              name="initialAmount"
              type="number"
              step="0.01"
              defaultValue="0"
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Création..." : "Créer la caisse"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
