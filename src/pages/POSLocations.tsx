
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type POSLocation = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

const POSLocations = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<POSLocation | null>(null);

  const { data: locations, refetch } = useQuery({
    queryKey: ["pos-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pos_locations")
        .select("*")
        .order("name");

      if (error) {
        toast.error("Erreur lors du chargement des dépôts PDV");
        throw error;
      }

      return data as POSLocation[];
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const locationData = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string || null,
      email: formData.get("email") as string || null,
      is_active: true,
    };

    try {
      if (selectedLocation) {
        const { error } = await supabase
          .from("pos_locations")
          .update(locationData)
          .eq("id", selectedLocation.id);

        if (error) throw error;
        toast.success("Dépôt PDV mis à jour avec succès");
      } else {
        const { error } = await supabase
          .from("pos_locations")
          .insert([locationData]);

        if (error) throw error;
        toast.success("Dépôt PDV ajouté avec succès");
      }

      setIsAddDialogOpen(false);
      setSelectedLocation(null);
      refetch();
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error(error);
    }
  };

  const handleDelete = async (location: POSLocation) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce dépôt PDV ?")) return;

    try {
      const { error } = await supabase
        .from("pos_locations")
        .delete()
        .eq("id", location.id);

      if (error) throw error;
      toast.success("Dépôt PDV supprimé avec succès");
      refetch();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression");
      console.error(error);
    }
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
              <Store className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-500">
                Dépôts PDV
              </h1>
              <p className="text-muted-foreground">
                Gestion des points de vente
              </p>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setSelectedLocation(null);
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un PDV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedLocation ? "Modifier le dépôt PDV" : "Nouveau dépôt PDV"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setSelectedLocation(null);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    {selectedLocation ? "Mettre à jour" : "Ajouter"}
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
                <TableHead>Adresse</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations?.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>{location.address}</TableCell>
                  <TableCell>{location.phone || "-"}</TableCell>
                  <TableCell>{location.email || "-"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${location.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {location.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedLocation(location);
                          setIsAddDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(location)}
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

export default POSLocations;
