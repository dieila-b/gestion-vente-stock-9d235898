
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { POSLocation } from "@/types/pos-locations";

interface POSLocationFormProps {
  selectedLocation: POSLocation | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onCancel: () => void;
}

export function POSLocationForm({ selectedLocation, onSubmit, onCancel }: POSLocationFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name">Nom</label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={selectedLocation?.name}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="address">Adresse</label>
        <Input
          id="address"
          name="address"
          required
          defaultValue={selectedLocation?.address}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="phone">Téléphone</label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={selectedLocation?.phone || ""}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={selectedLocation?.email || ""}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="manager">Responsable</label>
        <Input
          id="manager"
          name="manager"
          defaultValue={selectedLocation?.manager || ""}
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
          {selectedLocation ? "Mettre à jour" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}
