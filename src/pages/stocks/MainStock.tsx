import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowUpDown, Plus, Building2, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useWarehouseStock } from "@/hooks/use-warehouse-stock";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Warehouse {
  id: string;
  name: string;
  location: string;
  surface: number;
  capacity: number;
  manager: string;
  status: string;
  occupied: number;
}

interface NewWarehouse {
  name: string;
  location: string;
  surface: number;
  capacity: number;
  manager: string;
}

export default function MainStock() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("_all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState<NewWarehouse>({
    name: "",
    location: "",
    surface: 0,
    capacity: 0,
    manager: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: stockItems = [], isLoading } = useWarehouseStock(selectedWarehouse, false);

  const { data: warehouses = [] } = useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('id, name, location, surface, capacity, manager, status, occupied')
        .order('name');
      
      if (error) throw error;
      return data as Warehouse[];
    }
  });

  const handleCreateWarehouse = async () => {
    try {
      const { error } = await supabase
        .from('warehouses')
        .insert([newWarehouse]);

      if (error) throw error;

      toast({
        title: "Entrepôt créé",
        description: "Le nouvel entrepôt a été ajouté avec succès.",
      });

      setNewWarehouse({
        name: "",
        location: "",
        surface: 0,
        capacity: 0,
        manager: "",
      });
      setIsWarehouseDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'entrepôt.",
        variant: "destructive",
      });
    }
  };

  const filteredItems = stockItems.filter((item) => {
    const matchesWarehouse = selectedWarehouse === "_all" 
      ? true 
      : item.warehouse_id === selectedWarehouse;
    
    const matchesSearch = searchQuery.toLowerCase().trim() === "" 
      ? true 
      : (item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.product?.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.product?.category?.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesWarehouse && matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Stock Principal</h1>
          <p className="text-muted-foreground mt-2">
            Gestion du stock principal
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isWarehouseDialogOpen} onOpenChange={setIsWarehouseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="glass-effect hover:neon-glow">
                <Plus className="w-4 h-4 mr-2" />
                Nouvel Entrepôt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un entrepôt</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={newWarehouse.name}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={newWarehouse.location}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surface">Surface (m²)</Label>
                  <Input
                    id="surface"
                    type="number"
                    value={newWarehouse.surface}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, surface: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacité</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newWarehouse.capacity}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, capacity: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Responsable</Label>
                  <Input
                    id="manager"
                    value={newWarehouse.manager}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, manager: e.target.value })}
                  />
                </div>
                <Button 
                  className="w-full mt-4"
                  onClick={handleCreateWarehouse}
                  disabled={!newWarehouse.name || !newWarehouse.location || !newWarehouse.manager}
                >
                  Créer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="glass-effect hover:neon-glow">
            Exporter les données
          </Button>
        </div>
      </div>

      <Card className="enhanced-glass p-6">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-lg font-semibold text-gradient">Liste des Entrepôts</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Rechercher..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-effect"
                />
              </div>
              <Button variant="outline" className="glass-effect">
                <Filter className="mr-2 h-4 w-4" />
                Filtrer
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entrepôt</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Surface</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      Aucun entrepôt trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  warehouses.map((warehouse) => {
                    const occupancyRate = (warehouse.occupied / warehouse.capacity) * 100;
                    const isNearCapacity = occupancyRate >= 90;
                    const isOverCapacity = occupancyRate > 100;

                    return (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {warehouse.name}
                          </div>
                        </TableCell>
                        <TableCell>{warehouse.location}</TableCell>
                        <TableCell>{warehouse.surface} m²</TableCell>
                        <TableCell>{warehouse.capacity} unités</TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>
                                {Math.round(occupancyRate)}% ({warehouse.occupied}/{warehouse.capacity})
                              </span>
                            </div>
                            <div className="w-full bg-gray-700/30 rounded-full h-2.5">
                              <div 
                                className={cn(
                                  "rounded-full h-2.5 transition-all duration-500",
                                  {
                                    'bg-gradient-to-r from-red-500 to-red-600': isOverCapacity,
                                    'bg-gradient-to-r from-yellow-500 to-orange-500': isNearCapacity && !isOverCapacity,
                                    'bg-gradient-to-r from-blue-500 to-purple-500': !isNearCapacity
                                  }
                                )}
                                style={{ 
                                  width: `${Math.min(occupancyRate, 100)}%`
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{warehouse.manager}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={warehouse.status === 'Actif' ? 'default' : 'secondary'}
                          >
                            {warehouse.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gradient mb-6">
          {selectedWarehouse === "_all" 
            ? "Liste des Articles" 
            : `Liste des Articles - ${warehouses.find(w => w.id === selectedWarehouse)?.name || ""}`}
        </h2>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Select
            value={selectedWarehouse}
            onValueChange={setSelectedWarehouse}
          >
            <SelectTrigger className="w-[200px] glass-effect">
              <SelectValue placeholder="Sélectionner un entrepôt" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Tous les entrepôts</SelectItem>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Article</TableHead>
                <TableHead>Entrepôt</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Prix unitaire</TableHead>
                <TableHead className="text-right">Valeur totale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Chargement des données...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Aucun article trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product?.reference}</TableCell>
                    <TableCell>{item.product?.category}</TableCell>
                    <TableCell className="font-medium">
                      {item.product?.name}
                    </TableCell>
                    <TableCell>{item.warehouse?.name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {item.unit_price.toLocaleString('fr-FR')} GNF
                    </TableCell>
                    <TableCell className="text-right">
                      {item.total_value.toLocaleString('fr-FR')} GNF
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
