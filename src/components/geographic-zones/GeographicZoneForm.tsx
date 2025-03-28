
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GeographicZone, ParentZone } from "@/types/geographic";
import { FormEvent } from "react";

interface GeographicZoneFormProps {
  selectedZone: GeographicZone | null;
  parentZones: ParentZone[] | undefined;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  onCancel: () => void;
  getZoneTypeName: (type: GeographicZone["type"]) => string;
}

export function GeographicZoneForm({
  selectedZone,
  parentZones,
  onSubmit,
  onCancel,
  getZoneTypeName,
}: GeographicZoneFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name">Nom</label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={selectedZone?.name}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="type">Type</label>
        <Select name="type" defaultValue={selectedZone?.type || "emplacement"}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="region">Région</SelectItem>
            <SelectItem value="zone">Zone</SelectItem>
            <SelectItem value="emplacement">Emplacement</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor="parent_id">Zone parent</label>
        <Select name="parent_id" defaultValue={selectedZone?.parent_id}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une zone parent (optionnel)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Aucun parent</SelectItem>
            {parentZones?.map((zone) => (
              <SelectItem key={zone.id} value={zone.id}>
                {zone.name} ({getZoneTypeName(zone.type)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor="description">Description</label>
        <Input
          id="description"
          name="description"
          defaultValue={selectedZone?.description || ""}
        />
      </div>
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button type="submit">
          {selectedZone ? "Mettre à jour" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}
