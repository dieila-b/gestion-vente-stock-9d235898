
import { Input } from "@/components/ui/input";

interface DeliveryNoteHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function DeliveryNoteHeader({ searchQuery, onSearchChange }: DeliveryNoteHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Bon de livraison</h1>
        <p className="text-muted-foreground">Liste des bons de livraison créés à partir des bons de commande approuvés</p>
      </div>
      <div>
        <Input
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-[300px]"
        />
      </div>
    </div>
  );
}
