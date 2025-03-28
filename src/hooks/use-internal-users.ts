
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
        user_id: user.user_id
      }));

      return transformedData as InternalUser[];
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

  return {
    users,
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
