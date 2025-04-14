
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProductUnit, NewProductUnit } from "@/types/catalog";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductUnitFormProps {
  isOpen: boolean;
  onClose: () => void;
  unit: ProductUnit | null;
}

export function ProductUnitForm({ isOpen, unit, onClose }: ProductUnitFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewProductUnit>({
    name: unit?.name ?? "",
    symbol: unit?.symbol ?? "",
    description: unit?.description ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Submitting unit data:", formData);
      
      if (unit) {
        // Update existing unit
        const { error } = await supabase
          .from('product_units')
          .update(formData)
          .eq('id', unit.id);

        if (error) {
          console.error('Error updating unit:', error);
          throw error;
        }
        toast.success("Unité mise à jour avec succès");
      } else {
        // Create new unit
        const { error } = await supabase
          .from('product_units')
          .insert(formData);

        if (error) {
          console.error('Error creating unit:', error);
          throw error;
        }
        toast.success("Unité créée avec succès");
      }

      queryClient.invalidateQueries({ queryKey: ['product-units'] });
      onClose();
    } catch (error) {
      console.error('Error saving product unit:', error);
      toast.error("Erreur lors de l'enregistrement de l'unité");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          className="enhanced-glass"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="symbol">Symbole</Label>
        <Input
          id="symbol"
          value={formData.symbol}
          onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
          required
          className="enhanced-glass"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="enhanced-glass"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="enhanced-glass"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="enhanced-glass"
        >
          {isSubmitting ? "Enregistrement..." : unit ? "Modifier" : "Créer"}
        </Button>
      </div>
    </form>
  );
}
