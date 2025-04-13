
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GeographicZone } from "@/types/geographic-zone";

type ZoneType = "country" | "state" | "city" | "district" | "warehouse_zone";

interface GeographicZoneFormProps {
  selectedZone: GeographicZone | null;
  parentZones: GeographicZone[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  getZoneTypeName: (type: string) => string;
}

export const GeographicZoneForm = ({
  selectedZone,
  parentZones,
  onSubmit,
  onCancel,
  getZoneTypeName,
}: GeographicZoneFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "country" as ZoneType,
    parent_id: null as string | null,
  });

  useEffect(() => {
    if (selectedZone) {
      setFormData({
        name: selectedZone.name || "",
        type: selectedZone.type as ZoneType || "country",
        parent_id: selectedZone.parent_id || null,
      });
    } else {
      setFormData({
        name: "",
        type: "country",
        parent_id: null,
      });
    }
  }, [selectedZone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTypeChange = (value: ZoneType) => {
    setFormData({
      ...formData,
      type: value,
      // Reset parent when type changes
      parent_id: null,
    });
  };

  const handleParentChange = (value: string) => {
    setFormData({
      ...formData,
      parent_id: value === "none" ? null : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: selectedZone?.id,
    });
  };

  // Filter parent zones based on the selected type
  const getAvailableParents = () => {
    const typeHierarchy: Record<ZoneType, ZoneType[]> = {
      country: [],
      state: ["country"],
      city: ["state", "country"],
      district: ["city", "state"],
      warehouse_zone: ["district", "city", "state"],
    };

    const allowedParentTypes = typeHierarchy[formData.type] || [];
    
    if (allowedParentTypes.length === 0) {
      return [];
    }

    return parentZones.filter((zone) => 
      allowedParentTypes.includes(zone.type as ZoneType) && 
      zone.id !== selectedZone?.id
    );
  };

  const availableParents = getAvailableParents();
  const showParentField = availableParents.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nom de la zone"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="country">Pays</SelectItem>
            <SelectItem value="state">État/Province</SelectItem>
            <SelectItem value="city">Ville</SelectItem>
            <SelectItem value="district">Quartier</SelectItem>
            <SelectItem value="warehouse_zone">Zone d'entrepôt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showParentField && (
        <div className="space-y-2">
          <Label htmlFor="parent">Parent</Label>
          <Select
            value={formData.parent_id || "none"}
            onValueChange={handleParentChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un parent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun parent</SelectItem>
              {availableParents.map((zone) => (
                <SelectItem 
                  key={zone.id} 
                  value={zone.id || "placeholder-id"}
                >
                  {zone.name} ({getZoneTypeName(zone.type)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {selectedZone ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </form>
  );
};
