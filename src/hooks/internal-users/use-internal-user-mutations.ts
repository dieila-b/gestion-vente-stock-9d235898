
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { InternalUser } from "@/types/internal-user";

export const useInternalUserMutations = (refetch: () => void) => {
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
      require_password_change: formData.get("requirePasswordChange") === "on",
      two_factor_enabled: formData.get("twoFactorEnabled") === "on",
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
        if (userData.require_password_change) {
          await sendWelcomeEmail(userData.email);
        }

        toast.success("Utilisateur créé avec succès");
      }

      refetch();
      return true;
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Une erreur est survenue lors de la création de l'utilisateur");
      return false;
    }
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>, selectedUser: InternalUser | null) => {
    e.preventDefault();
    if (!selectedUser) return false;

    const formData = new FormData(e.currentTarget);
    
    const userData = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      role: formData.get("role") as "admin" | "manager" | "employee",
      address: formData.get("address") as string,
      require_password_change: formData.get("requirePasswordChange") === "on",
      two_factor_enabled: formData.get("twoFactorEnabled") === "on",
      updated_at: new Date().toISOString()
    };

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Vous devez être connecté pour effectuer cette action");
        return false;
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
      refetch();
      return true;
    } catch (error) {
      toast.error("Une erreur est survenue lors de la mise à jour");
      console.error(error);
      return false;
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

  return {
    handleCreateUser,
    handleUpdateUser,
    handleDelete,
    handleResetPassword,
  };
};
