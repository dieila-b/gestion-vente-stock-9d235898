
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { POSLocation } from "@/types/pos-locations";
import { Switch } from "@/components/ui/switch";

interface POSLocationFormProps {
  location: POSLocation | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export function POSLocationForm({ location, onSubmit, onCancel }: POSLocationFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          id="status"
          name="status"
          defaultChecked={location?.is_active !== false}
        />
        <Label htmlFor="status">Actif</Label>
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
