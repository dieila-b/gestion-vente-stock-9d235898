
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, User, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type InternalUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: "admin" | "manager" | "employee";
  address: string | null;
  is_active: boolean;
};

const InternalUsers = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté pour accéder à cette page");
        navigate("/auth"); // Redirection vers la page d'authentification
      }
    };
    
    checkAuth();
  }, [navigate]);

  const { data: users, refetch } = useQuery({
    queryKey: ["internal-users"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Vous devez être connecté pour accéder à cette page");
        navigate("/auth");
        throw new Error("Non authentifié");
      }

      const { data, error } = await supabase
        .from("internal_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des utilisateurs");
        throw error;
      }

      return data as InternalUser[];
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const userData = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      role: formData.get("role") as "admin" | "manager" | "employee",
      address: formData.get("address") as string,
    };

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Vous devez être connecté pour effectuer cette action");
        return;
      }

      if (selectedUser) {
        const { error } = await supabase
          .from("internal_users")
          .update(userData)
          .eq("id", selectedUser.id);

        if (error) throw error;
        toast.success("Utilisateur mis à jour avec succès");
      } else {
        const { error } = await supabase
          .from("internal_users")
          .insert([userData]);

        if (error) throw error;
        toast.success("Utilisateur ajouté avec succès");
      }

      setIsAddDialogOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error(error);
    }
  };

  const handleDelete = async (user: InternalUser) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Vous devez être connecté pour effectuer cette action");
        return;
      }

      const { error } = await supabase
        .from("internal_users")
        .delete()
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Utilisateur supprimé avec succès");
      refetch();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression");
      console.error(error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "employee":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
                Utilisateurs Internes
              </h1>
              <p className="text-muted-foreground">
                Gestion des utilisateurs et des droits d'accès
              </p>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setSelectedUser(null);
                  setIsAddDialogOpen(true);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="first_name">Prénom</label>
                    <Input
                      id="first_name"
                      name="first_name"
                      required
                      defaultValue={selectedUser?.first_name}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="last_name">Nom</label>
                    <Input
                      id="last_name"
                      name="last_name"
                      required
                      defaultValue={selectedUser?.last_name}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    defaultValue={selectedUser?.email}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone">Téléphone</label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={selectedUser?.phone || ""}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="address">Adresse</label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={selectedUser?.address || ""}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="role">Rôle</label>
                  <Select name="role" defaultValue={selectedUser?.role || "employee"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="employee">Employé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setSelectedUser(null);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    {selectedUser ? "Mettre à jour" : "Ajouter"}
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
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>{user.address || "-"}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role === "admin"
                        ? "Administrateur"
                        : user.role === "manager"
                        ? "Manager"
                        : "Employé"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.is_active ? "default" : "secondary"}
                    >
                      {user.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsAddDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user)}
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

export default InternalUsers;
