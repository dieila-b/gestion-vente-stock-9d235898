
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Warehouse } from "@/types/warehouse";
import { Switch } from "@/components/ui/switch";
import { FormEvent, useState, useEffect } from "react";

interface WarehouseFormProps {
  warehouse: Warehouse | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export function WarehouseForm({ warehouse, onSubmit, onCancel }: WarehouseFormProps) {
  const [isActive, setIsActive] = useState<boolean>(warehouse?.is_active !== false);
  
  // Réinitialiser isActive lorsque warehouse change
  useEffect(() => {
    setIsActive(warehouse?.is_active !== false);
  }, [warehouse]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Créer un champ caché pour is_active s'il n'existe pas déjà
    const form = e.currentTarget;
    const formElement = form.elements.namedItem('is_active') as HTMLInputElement;
    
    if (formElement) {
      formElement.value = String(isActive);
    } else {
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = 'is_active';
      hiddenInput.value = String(isActive);
      form.appendChild(hiddenInput);
    }

    // Ajouter également un champ caché pour status basé sur is_active
    const statusElement = form.elements.namedItem('status') as HTMLInputElement;
    if (statusElement) {
      statusElement.value = isActive ? 'Actif' : 'Inactif';
    } else {
      const statusInput = document.createElement('input');
      statusInput.type = 'hidden';
      statusInput.name = 'status';
      statusInput.value = isActive ? 'Actif' : 'Inactif';
      form.appendChild(statusInput);
    }
    
    onSubmit(e);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          name="name"
          defaultValue={warehouse?.name || ""}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          name="address"
          defaultValue={warehouse?.address || ""}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Localisation</Label>
        <Input
          id="location"
          name="location"
          defaultValue={warehouse?.location || ""}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="surface">Surface (m²)</Label>
          <Input
            id="surface"
            name="surface"
            type="number"
            defaultValue={warehouse?.surface || 0}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacité</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            defaultValue={warehouse?.capacity || 0}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="occupied">Occupation</Label>
        <Input
          id="occupied"
          name="occupied"
          type="number"
          defaultValue={warehouse?.occupied || 0}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="manager">Responsable</Label>
        <Input
          id="manager"
          name="manager"
          defaultValue={warehouse?.manager || ""}
          required
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="status-switch"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
        <Label htmlFor="status-switch">Actif</Label>
        <input type="hidden" name="is_active" value={String(isActive)} />
        <input type="hidden" name="status" value={isActive ? "Actif" : "Inactif"} />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {warehouse ? "Mettre à jour" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}
