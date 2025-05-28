
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFetchWarehouses } from "@/hooks/delivery-notes/use-fetch-warehouses";
import { useFetchPOSLocations } from "@/hooks/use-pos-locations";

interface LocationSelectionSectionProps {
  selectedLocationId: string;
  onLocationChange: (locationId: string) => void;
}

export function LocationSelectionSection({
  selectedLocationId,
  onLocationChange
}: LocationSelectionSectionProps) {
  const { data: warehouses = [] } = useFetchWarehouses();
  const { data: posLocations = [] } = useFetchPOSLocations();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Emplacement de stockage *</label>
      <Select value={selectedLocationId} onValueChange={onLocationChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un emplacement" />
        </SelectTrigger>
        <SelectContent>
          {warehouses.length > 0 && (
            <>
              <SelectItem value="warehouses-header" disabled className="font-semibold text-sm text-muted-foreground">
                Entrepôts
              </SelectItem>
              {warehouses.map(warehouse => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </>
          )}
          {posLocations.length > 0 && (
            <>
              <SelectItem value="pos-header" disabled className="font-semibold text-sm text-muted-foreground">
                Points de Vente
              </SelectItem>
              {posLocations.map(pos => (
                <SelectItem key={pos.id} value={pos.id}>
                  {pos.name}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
