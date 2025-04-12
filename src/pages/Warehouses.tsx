
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Warehouse, Search, Plus, Map, Package, Users, Building2, X, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Warehouse {
  id: string;
  name: string;
  location: string;
  surface: number;
  capacity: number;
  occupied: number;
  manager: string;
  status: "Actif" | "Maintenance" | "Inactif";
}

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  location: z.string().min(2, "La localisation doit contenir au moins 2 caractères"),
  surface: z.number().min(1, "La surface doit être supérieure à 0"),
  capacity: z.number().min(1, "La capacité doit être supérieure à 0"),
  manager: z.string().min(2, "Le nom du manager doit contenir au moins 2 caractères"),
  status: z.enum(["Actif", "Maintenance", "Inactif"]),
});

export default function Warehouses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*');
      
      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les entrepôts.",
          variant: "destructive",
        });
        throw error;
      }
      
      return data as Warehouse[];
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      surface: 0,
      capacity: 0,
      manager: "",
      status: "Actif",
    },
  });

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingWarehouse) {
        const { error } = await supabase
          .from('warehouses')
          .update({
            name: values.name,
            location: values.location,
            surface: values.surface,
            capacity: values.capacity,
            manager: values.manager,
            status: values.status,
          })
          .eq('id', editingWarehouse.id);

        if (error) throw error;

        toast({
          title: "Entrepôt modifié avec succès",
          description: "Les modifications ont été enregistrées.",
        });
      } else {
        const { error } = await supabase
          .from('warehouses')
          .insert([{
            name: values.name,
            location: values.location,
            surface: values.surface,
            capacity: values.capacity,
            manager: values.manager,
            status: values.status,
            occupied: 0,
          }]);

        if (error) throw error;

        toast({
          title: "Entrepôt créé avec succès",
          description: "Le nouvel entrepôt a été ajouté à la liste.",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setIsDialogOpen(false);
      setEditingWarehouse(null);
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'opération.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    form.reset({
      name: warehouse.name,
      location: warehouse.location,
      surface: warehouse.surface,
      capacity: warehouse.capacity,
      manager: warehouse.manager,
      status: warehouse.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (warehouseId: string) => {
    try {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', warehouseId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast({
        title: "Entrepôt supprimé",
        description: "L'entrepôt a été supprimé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-full">
        <div className="space-y-6 p-4">
          <div className="flex justify-between items-center animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold text-gradient bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400">
                Entrepôts
              </h1>
              <p className="text-muted-foreground mt-2">
                Gestion et supervision des entrepôts
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="glass-effect hover:neon-glow transition-all duration-300 bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel entrepôt
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel border-0 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gradient">
                    {editingWarehouse ? "Modifier l'entrepôt" : "Créer un nouvel entrepôt"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de l'entrepôt</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Entrez le nom"
                                className="glass-effect"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Localisation</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Adresse de l'entrepôt"
                                className="glass-effect"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="surface"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Surface (m²)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Surface en m²"
                                className="glass-effect"
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capacité (unités)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Capacité en unités"
                                className="glass-effect"
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="manager"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Manager</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nom du manager"
                                className="glass-effect"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Statut</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="glass-effect">
                                  <SelectValue placeholder="Sélectionnez un statut" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Actif">Actif</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                <SelectItem value="Inactif">Inactif</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setEditingWarehouse(null);
                          form.reset();
                        }}
                        className="glass-effect"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="glass-effect bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30"
                      >
                        {editingWarehouse ? "Mettre à jour" : "Créer l'entrepôt"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <StatsCard
              title="Total Entrepôts"
              value={warehouses.length.toString()}
              icon={Building2}
              trend={{ value: 2, isPositive: true }}
            />
            <StatsCard
              title="Surface Totale"
              value={`${warehouses.reduce((acc, w) => acc + w.surface, 0)} m²`}
              icon={Map}
              trend={{ value: 15, isPositive: true }}
            />
            <StatsCard
              title="Taux Occupation Moyen"
              value={`${Math.round((warehouses.reduce((acc, w) => acc + (w.occupied / w.capacity) * 100, 0) / warehouses.length) || 0)}%`}
              icon={Package}
              trend={{ value: 5, isPositive: true }}
            />
          </div>

          <Card className="enhanced-glass p-6 animate-fade-in overflow-hidden" style={{ animationDelay: "0.4s" }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gradient bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Liste des Entrepôts
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Rechercher un entrepôt..." 
                  className="pl-10 glass-effect"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="relative overflow-x-auto rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/10">
                    <TableHead className="text-white">Nom</TableHead>
                    <TableHead className="text-white">Localisation</TableHead>
                    <TableHead className="text-white">Surface</TableHead>
                    <TableHead className="text-white">Capacité</TableHead>
                    <TableHead className="text-white">Occupation</TableHead>
                    <TableHead className="text-white">Manager</TableHead>
                    <TableHead className="text-white">Statut</TableHead>
                    <TableHead className="text-white text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWarehouses.map((warehouse, index) => (
                    <TableRow
                      key={warehouse.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer glass-effect"
                      style={{ 
                        animationDelay: `${0.1 * (index + 1)}s`,
                        transform: "perspective(1000px) rotateX(0deg)",
                      }}
                      onMouseEnter={(e) => {
                        const target = e.currentTarget;
                        target.style.transform = "perspective(1000px) rotateX(2deg)";
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget;
                        target.style.transform = "perspective(1000px) rotateX(0deg)";
                      }}
                    >
                      <TableCell className="font-medium text-white">{warehouse.name}</TableCell>
                      <TableCell className="text-muted-foreground">{warehouse.location}</TableCell>
                      <TableCell>{warehouse.surface} m²</TableCell>
                      <TableCell>{warehouse.capacity} unités</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{Math.round((warehouse.occupied / warehouse.capacity) * 100) || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-700/30 rounded-full h-2.5">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2.5 transition-all duration-500"
                              style={{ width: `${(warehouse.occupied / warehouse.capacity) * 100 || 0}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{warehouse.manager}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          warehouse.status === "Actif" ? 'bg-green-500/20 text-green-500 border border-green-500/20' :
                          warehouse.status === "Maintenance" ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20' :
                          'bg-red-500/20 text-red-500 border border-red-500/20'
                        }`}>
                          {warehouse.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(warehouse)}
                            className="h-8 w-8 hover:bg-blue-500/20"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(warehouse.id)}
                            className="h-8 w-8 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
