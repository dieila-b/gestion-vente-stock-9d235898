
import { useState } from "react";
import { DeliveryNote } from "@/types/delivery-note";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditDeliveryNoteProps {
  deliveryNote: DeliveryNote;
  onClose: () => void;
}

export function EditDeliveryNote({ deliveryNote, onClose }: EditDeliveryNoteProps) {
  const [formData, setFormData] = useState({
    delivery_number: deliveryNote.delivery_number || '',
    notes: deliveryNote.notes || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // This would normally update the delivery note in the database
    try {
      // Add your API call here
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error("Error updating delivery note:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="delivery_number">Numéro de livraison</Label>
        <Input 
          id="delivery_number"
          name="delivery_number"
          value={formData.delivery_number}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>
    </form>
  );
}
