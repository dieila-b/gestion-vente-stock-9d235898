
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { InternalUser, SupabaseInternalUser } from "@/types/internal-user";

export const useInternalUsers = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [securitySettings, setSecuritySettings] = useState({
    requirePasswordChange: false,
    twoFactorEnabled: false,
  });
  const navigate = useNavigate();

  const { data: users, refetch, isLoading, error } = useQuery({
    queryKey: ["internal-users"],
    queryFn: async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          toast.error("Vous devez être connecté pour accéder à cette page");
          navigate("/auth");
          throw new Error("Non authentifié");
        }
        
        console.log("Fetching internal users...");
        const { data, error } = await supabase
          .from("internal_users")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching internal users:", error);
          toast.error("Erreur lors du chargement des utilisateurs");
          throw error;
        }

        console.log("Internal users data:", data);

        // Transform the data to ensure it matches InternalUser type
        const transformedData = (data as SupabaseInternalUser[]).map(user => ({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address,
          is_active: user.is_active,
          // Set default values for potentially missing properties
          require_password_change: user.require_password_change === true,
          two_factor_enabled: user.two_factor_enabled === true,
          last_login: user.last_login || null,
          created_at: user.created_at,
          updated_at: user.updated_at,
          user_id: user.user_id,
          auth_id: user.auth_id
        }));

        return transformedData as InternalUser[];
      } catch (err) {
        console.error("Error in queryFn:", err);
        throw err;
      }
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
        console.error("Auth error:", authError);
        toast.error(`Erreur d'authentification: ${authError.message}`);
        throw authError;
      }

      // Then, store the additional user data in your custom table
      if (authData.user) {
        const { error } = await supabase
          .from("internal_users")
          .insert([{ 
            ...userData, 
            auth_id: authData.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) {
          console.error("Database error:", error);
          toast.error(`Erreur de base de données: ${error.message}`);
          throw error;
        }

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
      updated_at: new Date().toISOString()
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

      if (error) {
        console.error("Update error:", error);
        toast.error(`Erreur de mise à jour: ${error.message}`);
        throw error;
      }

      // If email was changed, update in Auth
      if (userData.email !== selectedUser.email && selectedUser.auth_id) {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          selectedUser.auth_id,
          { email: userData.email }
        );
        
        if (authError) {
          console.error("Auth update error:", authError);
          toast.warning(`L'email a été mis à jour dans la base de données, mais pas dans l'authentification: ${authError.message}`);
        }
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

      if (error) {
        console.error("Delete error:", error);
        toast.error(`Erreur de suppression: ${error.message}`);
        throw error;
      }
      
      // If user has an auth_id, delete from Auth as well
      if (user.auth_id) {
        const { error: authError } = await supabase.auth.admin.deleteUser(
          user.auth_id
        );
        
        if (authError) {
          console.error("Auth delete error:", authError);
          toast.warning(`L'utilisateur a été supprimé de la base de données, mais pas de l'authentification: ${authError.message}`);
        }
      }

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
      
      if (error) {
        console.error("Reset password error:", error);
        toast.error(`Erreur de réinitialisation: ${error.message}`);
        throw error;
      }
      
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
      // Pour démonstration, ce serait en réalité géré par une fonction Edge de Supabase
      // ou votre backend pour envoyer un email de bienvenue avec instructions de réinitialisation de mot de passe
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

  return {
    users,
    isLoading,
    error,
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedUser,
    setSelectedUser,
    activeTab,
    setActiveTab,
    securitySettings,
    setSecuritySettings,
    handleCreateUser,
    handleUpdateUser,
    handleDelete,
    handleResetPassword,
    handleDialogOpen,
    getRoleBadgeColor,
  };
};
