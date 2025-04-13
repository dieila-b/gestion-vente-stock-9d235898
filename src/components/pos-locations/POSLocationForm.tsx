
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { POSLocation } from "@/types/pos-locations";
import { Switch } from "@/components/ui/switch";
import { FormEvent, useState, useEffect } from "react";

interface POSLocationFormProps {
  location: POSLocation | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export function POSLocationForm({ location, onSubmit, onCancel }: POSLocationFormProps) {
  const [isActive, setIsActive] = useState<boolean>(location?.is_active !== false);
  
  // Réinitialiser isActive lorsque location change
  useEffect(() => {
    setIsActive(location?.is_active !== false);
  }, [location]);

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
      statusElement.value = isActive ? 'active' : 'inactive';
    } else {
      const statusInput = document.createElement('input');
      statusInput.type = 'hidden';
      statusInput.name = 'status';
      statusInput.value = isActive ? 'active' : 'inactive';
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
          defaultValue={location?.name || ""}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          name="address"
          defaultValue={location?.address || ""}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          name="phone"
          defaultValue={location?.phone || ""}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={location?.email || ""}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="manager">Responsable</Label>
        <Input
          id="manager"
          name="manager"
          defaultValue={location?.manager || ""}
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
        <input type="hidden" name="status" value={isActive ? "active" : "inactive"} />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {location ? "Mettre à jour" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}
