
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
import { UserPlus, User, Pencil, Trash2, Mail, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type InternalUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: "admin" | "manager" | "employee";
  address: string | null;
  is_active: boolean;
  require_password_change: boolean;
  two_factor_enabled: boolean;
  last_login: string | null;
};

const InternalUsers = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [securitySettings, setSecuritySettings] = useState({
    requirePasswordChange: false,
    twoFactorEnabled: false,
  });
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

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const userData = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      role: formData.get("role") as "admin" | "manager" | "employee",
      address: formData.get("address") as string,
      is_active: true,
      require_password_change: securitySettings.requirePasswordChange,
      two_factor_enabled: securitySettings.twoFactorEnabled,
    };

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Vous devez être connecté pour effectuer cette action");
        return;
      }

      // First, create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: generateTemporaryPassword(), // Generate a temporary password
        email_confirm: true, // Auto-confirm the email
      });

      if (authError) {
        throw authError;
      }

      // Then, store the additional user data in your custom table
      if (authData.user) {
        const { error } = await supabase
          .from("internal_users")
          .insert([{ ...userData, auth_id: authData.user.id }]);

        if (error) throw error;

        // Send welcome email with instructions for first login
        if (securitySettings.requirePasswordChange) {
          await sendWelcomeEmail(userData.email);
        }

        toast.success("Utilisateur créé avec succès");
      }

      setIsAddDialogOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Une erreur est survenue lors de la création de l'utilisateur");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    const formData = new FormData(e.currentTarget);
    
    const userData = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      role: formData.get("role") as "admin" | "manager" | "employee",
      address: formData.get("address") as string,
      require_password_change: securitySettings.requirePasswordChange,
      two_factor_enabled: securitySettings.twoFactorEnabled,
    };

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Vous devez être connecté pour effectuer cette action");
        return;
      }

      // Update user in your custom table
      const { error } = await supabase
        .from("internal_users")
        .update(userData)
        .eq("id", selectedUser.id);

      if (error) throw error;

      // If email was changed, update in Auth
      if (userData.email !== selectedUser.email) {
        // This would require additional setup with Auth admin APIs
        console.log("Email change requires Auth admin API update");
      }

      toast.success("Utilisateur mis à jour avec succès");
      setIsAddDialogOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la mise à jour");
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

  const handleResetPassword = async (user: InternalUser) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      toast.success(`Email de réinitialisation envoyé à ${user.email}`);
    } catch (error) {
      toast.error("Échec de l'envoi de l'email de réinitialisation");
      console.error(error);
    }
  };

  const handleDialogOpen = (user: InternalUser | null) => {
    setSelectedUser(user);
    if (user) {
      setSecuritySettings({
        requirePasswordChange: user.require_password_change || false,
        twoFactorEnabled: user.two_factor_enabled || false,
      });
    } else {
      setSecuritySettings({
        requirePasswordChange: false,
        twoFactorEnabled: false,
      });
    }
    setActiveTab("general");
    setIsAddDialogOpen(true);
  };

  // Helper functions
  const generateTemporaryPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const sendWelcomeEmail = async (email: string) => {
    try {
      // For demonstration purposes, this would actually be handled by a Supabase Edge Function
      // or your backend to send a welcome email with password reset instructions
      console.log(`Welcome email with password reset instructions would be sent to ${email}`);
      return true;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return false;
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
                onClick={() => handleDialogOpen(null)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">Informations générales</TabsTrigger>
                  <TabsTrigger value="security">Sécurité</TabsTrigger>
                </TabsList>

                <form onSubmit={selectedUser ? handleUpdateUser : handleCreateUser} className="mt-4">
                  <TabsContent value="general" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="first_name">Prénom</label>
                        <Input
                          id="first_name"
                          name="first_name"
                          required
                          defaultValue={selectedUser?.first_name || ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="last_name">Nom</label>
                        <Input
                          id="last_name"
                          name="last_name"
                          required
                          defaultValue={selectedUser?.last_name || ""}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          defaultValue={selectedUser?.email || ""}
                        />
                      </div>
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
                  </TabsContent>

                  <TabsContent value="security" className="space-y-4">
                    <Card className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="font-medium">Modifier le mot de passe à la première connexion</div>
                            <div className="text-sm text-muted-foreground">
                              L'utilisateur devra changer son mot de passe lors de sa première connexion
                            </div>
                          </div>
                          <Switch
                            checked={securitySettings.requirePasswordChange}
                            onCheckedChange={(checked) => 
                              setSecuritySettings({...securitySettings, requirePasswordChange: checked})}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="font-medium">Authentification à deux facteurs</div>
                            <div className="text-sm text-muted-foreground">
                              Activer l'authentification à deux facteurs pour cet utilisateur
                            </div>
                          </div>
                          <Switch 
                            checked={securitySettings.twoFactorEnabled}
                            onCheckedChange={(checked) => 
                              setSecuritySettings({...securitySettings, twoFactorEnabled: checked})}
                          />
                        </div>

                        {selectedUser && (
                          <Button 
                            type="button"
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => handleResetPassword(selectedUser)}
                          >
                            <KeyRound className="mr-2 h-4 w-4" />
                            Réinitialiser le mot de passe
                          </Button>
                        )}
                      </div>
                    </Card>
                  </TabsContent>

                  <div className="flex justify-end gap-4 mt-6">
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
              </Tabs>
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
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Sécurité</TableHead>
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
                  <TableCell>
                    <div className="flex space-x-1">
                      {user.require_password_change && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                          <KeyRound className="h-3 w-3 mr-1" />
                          Changement MDP
                        </Badge>
                      )}
                      {user.two_factor_enabled && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          2FA
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDialogOpen(user)}
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
              {(!users || users.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InternalUsers;
