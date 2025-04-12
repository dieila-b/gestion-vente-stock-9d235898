
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomerReturn } from "@/types/customer-return";
import { supabase } from "@/integrations/supabase/client";

interface ReturnStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerReturn: CustomerReturn | null;
  onStatusChange: () => void;
}

export function ReturnStatusDialog({ isOpen, onClose, customerReturn, onStatusChange }: ReturnStatusDialogProps) {
  const [status, setStatus] = useState<'pending' | 'completed' | 'cancelled'>(customerReturn?.status || 'pending');
  const [notes, setNotes] = useState(customerReturn?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!customerReturn) return null;

  const handleSubmit = async () => {
    if (!customerReturn) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('customer_returns')
        .update({
          status,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerReturn.id);
      
      if (error) throw error;
      
      toast({
        title: "Statut mis à jour",
        description: "Le statut du retour a été mis à jour avec succès",
      });
      
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Error updating return status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du retour",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer le statut du retour</DialogTitle>
          <DialogDescription>
            Modifiez le statut du retour #{customerReturn.return_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as 'pending' | 'completed' | 'cancelled')}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="completed">Complété</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajoutez des notes supplémentaires..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
