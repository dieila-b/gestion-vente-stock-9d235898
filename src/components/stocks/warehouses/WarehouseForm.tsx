
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Warehouse } from "@/hooks/use-warehouse";

interface WarehouseFormProps {
  warehouse: Warehouse | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export function WarehouseForm({ warehouse, onSubmit, onCancel }: WarehouseFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
        <Label htmlFor="location">Localisation</Label>
        <Input
          id="location"
          name="location"
          defaultValue={warehouse?.location || ""}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="surface">Surface (m²)</Label>
        <Input
          id="surface"
          name="surface"
          type="number"
          min="0"
          defaultValue={warehouse?.surface || ""}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="capacity">Capacité (unités)</Label>
        <Input
          id="capacity"
          name="capacity"
          type="number"
          min="0"
          defaultValue={warehouse?.capacity || ""}
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
          id="status"
          name="status"
          defaultChecked={warehouse?.status === "Actif"}
        />
        <Label htmlFor="status">Actif</Label>
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
