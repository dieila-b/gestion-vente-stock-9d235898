
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { GeographicZone } from "@/types/geographic";

const StockLocation = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<GeographicZone | null>(null);

  const { data: zones, refetch } = useQuery({
    queryKey: ["geographic-zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("geographic_zones")
        .select("*")
        .order("name");

      if (error) {
        toast.error("Erreur lors du chargement des zones géographiques");
        throw error;
      }

      return data as GeographicZone[];
    },
  });

  const { data: parentZones } = useQuery({
    queryKey: ["parent-zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("geographic_zones")
        .select("id, name")
        .in("type", ["region", "zone"])
        .order("name");

      if (error) throw error;
      return data as Pick<GeographicZone, "id" | "name">[];
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const zoneData = {
      name: formData.get("name") as string,
      type: formData.get("type") as GeographicZone["type"],
      parent_id: formData.get("parent_id") as string || null,
      description: formData.get("description") as string || null,
    };

    try {
      if (selectedZone) {
        const { error } = await supabase
          .from("geographic_zones")
          .update(zoneData)
          .eq("id", selectedZone.id);

        if (error) throw error;
        toast.success("Zone géographique mise à jour avec succès");
      } else {
        const { error } = await supabase
          .from("geographic_zones")
          .insert([zoneData]);

        if (error) throw error;
        toast.success("Zone géographique ajoutée avec succès");
      }

      setIsAddDialogOpen(false);
      setSelectedZone(null);
      refetch();
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error(error);
    }
  };

  const handleDelete = async (zone: GeographicZone) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette zone ?")) return;

    try {
      const { error } = await supabase
        .from("geographic_zones")
        .delete()
        .eq("id", zone.id);

      if (error) throw error;
      toast.success("Zone géographique supprimée avec succès");
      refetch();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression");
      console.error(error);
    }
  };

  const getZoneTypeName = (type: GeographicZone["type"]) => {
    switch (type) {
      case "region":
        return "Région";
      case "zone":
        return "Zone";
      case "emplacement":
        return "Emplacement";
      default:
        return type;
    }
  };

  const getParentName = (parentId: string | undefined) => {
    if (!parentId || !parentZones) return "-";
    const parent = parentZones.find(zone => zone.id === parentId);
    return parent ? parent.name : "-";
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">
                Zone Géographie
              </h1>
              <p className="text-muted-foreground">
                Gestion des régions, zones et emplacements
              </p>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setSelectedZone(null);
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une zone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedZone ? "Modifier la zone" : "Nouvelle zone géographique"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                          {zone.name} ({getZoneTypeName(zone.type as GeographicZone["type"])})
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
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setSelectedZone(null);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    {selectedZone ? "Mettre à jour" : "Ajouter"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Zone parent</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones?.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell>{getZoneTypeName(zone.type)}</TableCell>
                  <TableCell>{getParentName(zone.parent_id)}</TableCell>
                  <TableCell>{zone.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedZone(zone);
                          setIsAddDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(zone)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StockLocation;
